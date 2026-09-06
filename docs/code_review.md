# Code Review

Full-repo review of the backend (`backend/app`), frontend (`frontend/src`), and operational scripts (`scripts/`), run at high effort. The project is an intentionally local-only, single-hardcoded-user MVP (see `CLAUDE.md`), so items that are by-design for that scope (fixed `user`/`password` login, no rate limiting, no HTTPS) are called out but not flagged as defects.

Findings are ordered by severity. Each includes the concrete failure scenario and a recommended action.

**Status: all 7 findings below have been fixed.** See the "Fix" note under each finding for what changed. Verified via the full backend/frontend test suites (27 + 24 passing) plus manual smoke tests: a live login/board/logout cycle, a concurrent-first-login race simulation (two simultaneous first-time `/api/board` requests now both succeed with a single `users` row instead of an `IntegrityError`), and the hardened stop script correctly identifying the uvicorn process by command line.

## Summary

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | High | Security | Static default session secret + `https_only=False` lets forged session cookies work if the app is ever bound beyond `127.0.0.1` without a `.env` override |
| 2 | Medium | Correctness | Race condition in `get_or_create_user_id` can raise an unhandled `IntegrityError` on concurrent first-login requests |
| 3 | Medium | Correctness/Debuggability | Bare `except Exception` in AI routes mislabels local bugs as OpenAI failures and leaks raw exception text to the client |
| 4 | Medium | Reliability | Session cookie has no size bound; chat history can grow the cookie past browser limits and silently drop the session |
| 5 | Low | Efficiency | Every board request opens 2+ SQLite connections and re-runs schema DDL that never changes after boot |
| 6 | Low | Efficiency | Board deep-copy goes through a JSON serialize/parse round-trip instead of `copy.deepcopy` |
| 7 | Low | Robustness | Stop script signals whatever process holds a stale PID, with no verification it's the server |

## Findings

### 1. Static session secret with `https_only=False` (High — Security)

**Where:** `backend/app/settings.py:11`, `backend/app/main.py:16-21`

```python
session_secret: str = "local-dev-session-secret"
```
```python
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    same_site="lax",
    https_only=False,
)
```

**Failure scenario:** If the app is ever run with `HOST=0.0.0.0` (e.g. inside a container or VM) without setting `SESSION_SECRET` in `.env`, every such deployment shares the same hardcoded signing key. Anyone who knows the key (it's in this public-ish repo/docs) can forge a session cookie containing `{"user": "user"}` and get full board access over plain HTTP, no credentials needed.

**Action:**
- Fail startup (raise, don't default) when `session_secret` is unset and `host` is not `127.0.0.1`/`localhost`.
- Alternatively, generate a random secret per run if none is configured, so an unconfigured deployment can't be cookie-forged with a known key.
- Document in `README.md`/`AGENTS.md` that `SESSION_SECRET` must be set before binding beyond localhost.

**Fix applied:** `Settings` (`backend/app/settings.py`) now has a `model_validator` that raises `ValueError` at startup if `host` is not in `{127.0.0.1, localhost}` and `session_secret` is still the default value.

### 2. Race condition in `get_or_create_user_id` (Medium — Correctness)

**Where:** `backend/app/database.py:306-320`

```python
def get_or_create_user_id(username: str, settings: Settings) -> int:
    with get_connection(settings) as connection:
        existing = connection.execute(
            "SELECT id FROM users WHERE username = ?", (username,),
        ).fetchone()
        if existing:
            return int(existing["id"])

        cursor = connection.execute(
            "INSERT INTO users (username) VALUES (?)", (username,),
        )
        connection.commit()
        return int(cursor.lastrowid)
```

**Failure scenario:** This is a check-then-insert with no conflict handling, unlike `save_board`'s `boards` table write which uses `ON CONFLICT ... DO UPDATE`. On the very first login, `AppShell`'s effect fires `GET /api/board`; in Next.js dev, React Strict Mode double-invokes effects, so two concurrent requests can both `SELECT` nothing and both `INSERT`. The second `INSERT` violates the `UNIQUE(username)` constraint and raises an unhandled `sqlite3.IntegrityError`, surfacing as a 500 instead of the board loading.

**Action:** Make the insert conflict-safe, mirroring the `boards` table pattern:
```python
connection.execute(
    "INSERT INTO users (username) VALUES (?) ON CONFLICT(username) DO NOTHING",
    (username,),
)
```
then re-select the id (or use `RETURNING id` with a fallback select), so concurrent first-time inserts can't raise.

**Fix applied:** `get_or_create_user_id` now does `INSERT ... ON CONFLICT(username) DO NOTHING` followed by a `SELECT`, so concurrent first-logins can no longer raise `IntegrityError`. Verified with a simulated concurrent first-login (two simultaneous `/api/board` requests both returned 200 with a single `users` row).

### 3. Bare `except Exception` mislabels and leaks internal errors (Medium — Correctness/Debuggability)

**Where:** `backend/app/main.py:259-263` (`ai_test`) and `backend/app/main.py:297-301` (`ai_chat`)

```python
except Exception as exc:
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"OpenAI request failed: {exc!r}",
    ) from exc
```

**Failure scenario:** If `run_board_ai`/`apply_card_operations` raises a non-`ValueError` bug — e.g. a `KeyError` from a malformed AI operation dict — the client is told `"OpenAI request failed: KeyError('card')"` with a 502. This misdirects debugging toward OpenAI connectivity when the actual bug is local application logic, and it leaks raw exception internals in the HTTP response body.

**Action:**
- Only catch `OpenAIRequestError` and `ValueError` explicitly for the "OpenAI failed" / "bad input" cases.
- Let genuinely unexpected exceptions propagate (or catch them separately and return a generic 500 without echoing `repr(exc)` to the client), and log the full exception server-side for debugging instead.

**Fix applied:** `ai_test` now only catches `ValueError` and `OpenAIRequestError`. `ai_chat` keeps those two, plus a final `except Exception` that logs the full traceback via `logger.exception(...)` and returns a generic 500 with no exception internals in the response body.

### 4. Unbounded session cookie size (Medium — Reliability)

**Where:** `backend/app/main.py:64-79`

```python
def set_chat_history(request: Request, history: list[dict[str, str]]) -> None:
    request.session[CHAT_HISTORY_KEY] = history[-20:]
```

**Failure scenario:** The signed session cookie carries both the auth flag and up to 20 chat turns. LLM replies can each run hundreds of characters; once the signed/base64 payload exceeds common per-cookie size limits (~4KB), browsers silently drop or truncate the `Set-Cookie` response. The user then appears logged out, or ends up with corrupted/partial chat history, with no error surfaced anywhere.

**Action:** Move chat history out of the client-side cookie into server-side storage keyed by session id or user (e.g. a table, or an in-memory dict acceptable for this local-only MVP), keeping only the auth flag in the signed cookie. At minimum, truncate by total character budget, not just message count, and log when truncation happens.

**Fix applied:** Chat history now lives in an in-memory `CHAT_HISTORY_STORE: dict[str, list[...]]` in `backend/app/main.py`, keyed by an opaque `chat_session_id` (a `secrets.token_urlsafe(16)` value) that's the only thing kept in the signed cookie. Logout pops the store entry before clearing the session, so it doesn't leak across logins.

### 5. Redundant SQLite connections and repeated schema DDL per request (Low — Efficiency)

**Where:** `backend/app/database.py:298-304`

```python
def get_connection(settings: Settings) -> sqlite3.Connection:
    initialize_database(settings)
    connection = sqlite3.connect(settings.db_path)
    ...
```

**Failure scenario:** `initialize_database` opens its own connection and re-issues two `CREATE TABLE IF NOT EXISTS` statements on every call to `get_connection`, and a single request can call `get_connection` multiple times (once via `get_or_create_user_id`, again via `get_or_create_board`/`save_board`). Every `GET`/`PUT /api/board` therefore opens 2+ short-lived connections and re-runs DDL that never changes after boot — pure overhead that scales with traffic for no benefit.

**Action:** Call `initialize_database(settings)` once at app startup (FastAPI lifespan/startup event) instead of inside `get_connection`, and have `get_connection` just open the connection.

**Fix applied:** `get_connection` no longer calls `initialize_database`. `backend/app/main.py` now runs it once via a FastAPI `lifespan` context manager (idiomatic replacement for the deprecated `@app.on_event("startup")`), which also re-fires correctly per `TestClient` context in tests.

### 6. Deep-copy via JSON round-trip (Low — Efficiency)

**Where:** `backend/app/database.py:486`

```python
next_board = json.loads(json.dumps(normalize_board_payload(board)))
```

**Failure scenario:** Every AI-driven card operation pays the cost of a full JSON serialize + re-parse just to get an isolated copy of the board dict, and implicitly assumes every value is JSON-safe.

**Action:** Use `copy.deepcopy(normalize_board_payload(board))` — same isolation guarantee, no serialization overhead.

**Fix applied:** Replaced with `copy.deepcopy(normalize_board_payload(board))`.

### 7. Stop script kills whatever holds a stale PID (Low — Robustness)

**Where:** `scripts/stop_server_mac_linux.sh:12-19`

```bash
PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  ...
```

**Failure scenario:** If the server previously crashed or was killed externally without removing `.run/server.pid`, and the OS later reuses that PID for an unrelated process, running `stop_server_mac_linux.sh` sends `SIGTERM` to that unrelated process instead of reporting "server not running."

**Action:** Verify the PID is actually the expected server process before signaling it, e.g. check the process command line matches `uvicorn backend.app.main:app` (`ps -p "$PID" -o command=` on macOS/Linux) before calling `kill`.

**Fix applied:** The script now checks `ps -p "$PID" -o command=` for `uvicorn backend.app.main:app` before killing, and leaves the process alone (with a message) if the PID doesn't match. Verified live: started the server, confirmed the script stops it, and that a mismatched PID is left alone.

## Recommended Action Order

1. Fix the session-secret default (#1) — cheapest fix, closes a real credential-forgery gap the moment this ever leaves localhost.
2. Fix the `get_or_create_user_id` race (#2) — small, targeted SQL change, removes a real unhandled-crash path.
3. Narrow the AI route exception handling (#3) — improves debuggability now, before more AI features are added.
4. Move chat history off the cookie (#4) — worth doing before chat history/features grow further.
5. Startup-time DB init + `copy.deepcopy` (#5, #6) — cheap cleanups, bundle into one small PR.
6. Harden the stop script's PID check (#7) — low urgency, but a one-line fix.
