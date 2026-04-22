from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware

from backend.app.ai import run_board_ai
from backend.app.database import get_or_create_board, save_board
from backend.app.openai_client import OpenAIRequestError, ask_openai
from backend.app.settings import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    same_site="lax",
    https_only=False,
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_EXPORT_DIR = PROJECT_ROOT / "frontend" / "out"
SESSION_USER_KEY = "user"
VALID_USERNAME = "user"
VALID_PASSWORD = "password"
CHAT_HISTORY_KEY = "chat_history"


class LoginPayload(BaseModel):
    username: str
    password: str


class BoardPayload(BaseModel):
    columns: list[dict]
    cards: dict


class AIChatPayload(BaseModel):
    message: str


def is_authenticated(request: Request) -> bool:
    return request.session.get(SESSION_USER_KEY) == VALID_USERNAME


def require_username(request: Request) -> str:
    username = request.session.get(SESSION_USER_KEY)
    if username != VALID_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return str(username)


def get_chat_history(request: Request) -> list[dict[str, str]]:
    history = request.session.get(CHAT_HISTORY_KEY, [])
    if not isinstance(history, list):
        return []
    return [
        item
        for item in history
        if isinstance(item, dict)
        and isinstance(item.get("role"), str)
        and isinstance(item.get("content"), str)
    ]


def set_chat_history(request: Request, history: list[dict[str, str]]) -> None:
    request.session[CHAT_HISTORY_KEY] = history[-20:]


def render_placeholder_html() -> str:
    return """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Project Management MVP</title>
    <style>
      :root {
        --accent-yellow: #ecad0a;
        --primary-blue: #209dd7;
        --secondary-purple: #753991;
        --navy-dark: #032147;
        --gray-text: #888888;
        --surface: #f7f8fb;
        --stroke: rgba(3, 33, 71, 0.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #ffffff 0%, var(--surface) 100%);
        color: var(--navy-dark);
      }
      main {
        max-width: 880px;
        margin: 0 auto;
        min-height: 100vh;
        padding: 64px 24px;
        display: flex;
        align-items: center;
      }
      .panel {
        width: 100%;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid var(--stroke);
        border-radius: 28px;
        padding: 32px;
        box-shadow: 0 18px 40px rgba(3, 33, 71, 0.12);
      }
      .eyebrow {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: var(--gray-text);
      }
      h1 {
        margin: 16px 0 0;
        font-size: 42px;
        line-height: 1.1;
      }
      p {
        max-width: 640px;
        line-height: 1.6;
        color: var(--gray-text);
      }
      .status {
        margin-top: 24px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 999px;
        background: var(--surface);
        border: 1px solid var(--stroke);
        font-weight: 600;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--accent-yellow);
      }
      code {
        color: var(--secondary-purple);
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <div class="eyebrow">Local Scaffold</div>
        <h1>Project Management MVP backend is running.</h1>
        <p>
          This placeholder page confirms FastAPI is serving the local app at
          <code>/</code>. The frontend build will replace this page in Part 3.
        </p>
        <div class="status">
          <span class="dot"></span>
          Health endpoint available at <code>/api/health</code>
        </div>
      </section>
    </main>
  </body>
</html>"""


@app.get("/", response_class=HTMLResponse)
async def index() -> HTMLResponse:
    if FRONTEND_EXPORT_DIR.exists():
        return HTMLResponse((FRONTEND_EXPORT_DIR / "index.html").read_text(encoding="utf-8"))
    return HTMLResponse(render_placeholder_html())


@app.get("/api/health")
async def health() -> JSONResponse:
    return JSONResponse(
        {
            "status": "ok",
            "app": settings.app_name,
            "host": settings.host,
            "port": settings.port,
        }
    )


@app.get("/api/auth/session")
async def auth_session(request: Request) -> JSONResponse:
    if not is_authenticated(request):
        return JSONResponse({"authenticated": False, "username": None})
    return JSONResponse({"authenticated": True, "username": VALID_USERNAME})


@app.post("/api/auth/login")
async def login(payload: LoginPayload, request: Request) -> JSONResponse:
    if payload.username != VALID_USERNAME or payload.password != VALID_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    request.session[SESSION_USER_KEY] = VALID_USERNAME
    return JSONResponse({"authenticated": True, "username": VALID_USERNAME})


@app.post("/api/auth/logout")
async def logout(request: Request, response: Response) -> JSONResponse:
    request.session.clear()
    return JSONResponse({"authenticated": False, "username": None})


@app.get("/api/board")
async def get_board(request: Request) -> JSONResponse:
    username = require_username(request)
    return JSONResponse(get_or_create_board(username, settings))


@app.put("/api/board")
async def update_board(payload: BoardPayload, request: Request) -> JSONResponse:
    username = require_username(request)
    try:
        board = save_board(username, payload.model_dump(), settings)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    return JSONResponse(board)


@app.post("/api/ai/test")
async def ai_test(request: Request) -> JSONResponse:
    require_username(request)

    try:
        result = await ask_openai("What is 2+2?", settings)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except OpenAIRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI request failed: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI request failed: {exc!r}",
        ) from exc

    return JSONResponse(
        {
            "prompt": "What is 2+2?",
            "model": result["model"],
            "response": result["response"],
        }
    )


@app.post("/api/ai/chat")
async def ai_chat(payload: AIChatPayload, request: Request) -> JSONResponse:
    username = require_username(request)
    board = get_or_create_board(username, settings)
    history = get_chat_history(request)

    try:
        result = await run_board_ai(
            board=board,
            user_message=payload.message,
            conversation_history=history,
            settings=settings,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except OpenAIRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI request failed: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI request failed: {exc!r}",
        ) from exc

    updated_board = save_board(username, result["board"], settings)
    history.extend(
        [
            {"role": "user", "content": payload.message},
            {"role": "assistant", "content": result["reply"]},
        ]
    )
    set_chat_history(request, history)

    return JSONResponse(
        {
            "model": result["model"],
            "reply": result["reply"],
            "operations": result["operations"],
            "board": updated_board,
        }
    )


@app.get("/api/ai/history")
async def ai_history(request: Request) -> JSONResponse:
    require_username(request)
    return JSONResponse({"messages": get_chat_history(request)})


if FRONTEND_EXPORT_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_EXPORT_DIR, html=True), name="frontend")
