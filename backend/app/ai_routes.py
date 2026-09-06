import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from backend.app.ai import run_board_ai
from backend.app.auth_routes import require_username
from backend.app.chat_store import get_chat_history, set_chat_history
from backend.app.database import get_or_create_board, save_board
from backend.app.openai_client import OpenAIRequestError, ask_openai
from backend.app.schemas import AIChatPayload
from backend.app.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(tags=["ai"])


@router.post("/api/ai/test")
async def ai_test(_username: str = Depends(require_username)) -> JSONResponse:
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

    return JSONResponse(
        {
            "prompt": "What is 2+2?",
            "model": result["model"],
            "response": result["response"],
        }
    )


@router.post("/api/ai/chat")
async def ai_chat(
    payload: AIChatPayload,
    request: Request,
    username: str = Depends(require_username),
) -> JSONResponse:
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
    except Exception:
        logger.exception("Unexpected error while running board AI")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected server error while processing the AI request.",
        ) from None

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


@router.get("/api/ai/history")
async def ai_history(
    request: Request,
    _username: str = Depends(require_username),
) -> JSONResponse:
    return JSONResponse({"messages": get_chat_history(request)})
