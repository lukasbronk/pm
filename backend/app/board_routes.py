from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from backend.app.auth_routes import require_username
from backend.app.database import get_or_create_board, save_board
from backend.app.schemas import BoardPayload
from backend.app.settings import get_settings

settings = get_settings()

router = APIRouter(tags=["board"])


@router.get("/api/board")
async def get_board(username: str = Depends(require_username)) -> JSONResponse:
    return JSONResponse(get_or_create_board(username, settings))


@router.put("/api/board")
async def update_board(
    payload: BoardPayload,
    username: str = Depends(require_username),
) -> JSONResponse:
    try:
        board = save_board(username, payload.model_dump(), settings)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    return JSONResponse(board)
