# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A local-only Project Management MVP: a Next.js Kanban board served by a Python FastAPI backend, with an AI chat sidebar (OpenAI) that can create/edit/move/delete cards. Single hardcoded user (`user`/`password`), one board per user, SQLite storage. Not intended for public deployment — see `AGENTS.md` for full business requirements and technical decisions, and `docs/PLAN.md` for the part-by-part implementation history and current architectural decisions.

## Commands

Backend (run from repo root; `uv` manages the Python env):

```bash
$HOME/.local/bin/uv run --cache-dir .uv-cache pytest              # run all backend tests
$HOME/.local/bin/uv run --cache-dir .uv-cache pytest backend/tests/test_app.py::test_name  # single test
$HOME/.local/bin/uv run --cache-dir .uv-cache uvicorn backend.app.main:app --reload
```

Frontend (run from `frontend/`):

```bash
npm run dev          # Next.js dev server
npm run build         # static export (writes frontend/out), used by the start script
npm run lint
npm run test:unit     # vitest
npm run test:e2e      # playwright, runs against the built/served app
npm run test:all
```

Full local app (builds frontend static export, then starts FastAPI which serves it):

```bash
./scripts/start_server_mac_linux.sh
./scripts/stop_server_mac_linux.sh
# scripts\start_server_windows.bat / stop_server_windows.bat on Windows
```

## Architecture

**Serving model**: FastAPI (`backend/app/main.py`) is the single server. It serves the Next.js static export from `frontend/out` at `/` (falls back to an inline placeholder HTML page if `out/` hasn't been built yet) and exposes all `/api/*` routes. The frontend is built with `output: "export"` (`frontend/next.config.ts`) — there is no separate Next.js server in the running app, only during `npm run dev`.

**Auth**: Fixed credentials (`user`/`password`) checked in `main.py`, backed by a signed session cookie (`starlette` `SessionMiddleware`, secret from `settings.session_secret`). `require_username()` gates every board/AI route.

**Board persistence** (`backend/app/database.py`): The entire board (columns, cards, view/theme/draw-run metadata) is stored as one JSON document per user in SQLite (`users` + `boards` tables, `boards.user_id` is `UNIQUE` — one board per user by design). Reads/writes always go through `normalize_board_payload()` (fills defaults, drops invalid fields) and `validate_board_payload()` (structural invariants: unique column/card ids, every column's `cardIds` reference an existing card, every card lives in exactly one column). Never bypass these when touching board data — they're what keeps AI-issued mutations from corrupting state. `docs/DATABASE.md` has the schema rationale.

**AI chat flow** (`backend/app/ai.py` + `backend/app/openai_client.py`): `/api/ai/chat` sends the full board JSON, user message, and session-scoped conversation history (last 20 turns, stored in the signed cookie session) to OpenAI's Responses API (`ask_openai_json`) with a strict JSON schema response format. The AI may only emit `create`/`edit`/`move`/`delete` card operations (never rename/add/remove columns) — see `SYSTEM_PROMPT` in `ai.py`. Operations are validated (`validate_ai_operations`) and applied via `apply_card_operations()` in `database.py`, then saved through the same `save_board()` path as manual frontend edits, so AI and human writes hit identical validation.

**Frontend** (`frontend/src`): `KanbanBoard.tsx` holds board state and drag handling (`@dnd-kit`), loading it from/saving it to the backend `/api/board` route rather than local state. `AiSidebar.tsx` is the chat widget (bottom-right, own scroll area, session-restored history) that calls `/api/ai/chat` and refreshes the board from the response. `AppShell.tsx` wires auth gating (login screen vs. board) around the rest of the UI. `lib/kanban.ts` holds board types, default/seed data shape, and drag-move logic — this is the canonical TS shape that mirrors the backend's `DEFAULT_BOARD`/normalization in `database.py`; keep the two in sync when changing the board model.

**Config**: `backend/app/settings.py` loads from root `.env` (`OPENAI_API_KEY`, `openai_model` default `gpt-5.2`, `db_path` default `backend/data/pm.sqlite3`, binds to `127.0.0.1`). The OpenAI key is server-side only.

## Notes

- `docs/gaming/*` documents a separate gaming/PM-hybrid concept explored on a branch (see git log: "did some fun experiments trying to combine gaming and project management - failed a bit") — treat it as exploratory, not the current product direction, unless told otherwise. The board model does carry some vestigial fields from that exploration (`viewMode`, `themeId`, `playerProfile`, `drawSettings`, `runState`).
- Root `AGENTS.md`, `backend/AGENTS.md`, and `frontend/AGENTS.md` contain the original per-directory agent guides; `docs/PLAN.md` tracks each implementation part as a checklist and is the source of truth for what's been decided vs. still open.
