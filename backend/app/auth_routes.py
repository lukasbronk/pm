from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

from backend.app.chat_store import clear_chat_history
from backend.app.schemas import LoginPayload

SESSION_USER_KEY = "user"
VALID_USERNAME = "user"
VALID_PASSWORD = "password"

router = APIRouter(tags=["auth"])


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


@router.get("/api/auth/session")
async def auth_session(request: Request) -> JSONResponse:
    if not is_authenticated(request):
        return JSONResponse({"authenticated": False, "username": None})
    return JSONResponse({"authenticated": True, "username": VALID_USERNAME})


@router.post("/api/auth/login")
async def login(payload: LoginPayload, request: Request) -> JSONResponse:
    if payload.username != VALID_USERNAME or payload.password != VALID_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    request.session[SESSION_USER_KEY] = VALID_USERNAME
    return JSONResponse({"authenticated": True, "username": VALID_USERNAME})


@router.post("/api/auth/logout")
async def logout(request: Request) -> JSONResponse:
    clear_chat_history(request)
    request.session.clear()
    return JSONResponse({"authenticated": False, "username": None})
