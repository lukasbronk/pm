from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from backend.app.ai_routes import router as ai_router
from backend.app.auth_routes import router as auth_router
from backend.app.board_routes import router as board_router
from backend.app.database import initialize_database
from backend.app.placeholder import render_placeholder_html
from backend.app.settings import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    initialize_database(settings)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    same_site="lax",
    https_only=False,
)

app.include_router(auth_router)
app.include_router(board_router)
app.include_router(ai_router)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_EXPORT_DIR = PROJECT_ROOT / "frontend" / "out"


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


if FRONTEND_EXPORT_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_EXPORT_DIR, html=True), name="frontend")
