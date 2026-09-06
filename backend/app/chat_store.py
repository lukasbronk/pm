import secrets

from starlette.requests import Request

CHAT_SESSION_ID_KEY = "chat_session_id"

_CHAT_HISTORY_STORE: dict[str, list[dict[str, str]]] = {}


def get_chat_history(request: Request) -> list[dict[str, str]]:
    session_id = request.session.get(CHAT_SESSION_ID_KEY)
    if not isinstance(session_id, str):
        return []
    return _CHAT_HISTORY_STORE.get(session_id, [])


def set_chat_history(request: Request, history: list[dict[str, str]]) -> None:
    session_id = request.session.get(CHAT_SESSION_ID_KEY)
    if not isinstance(session_id, str):
        session_id = secrets.token_urlsafe(16)
        request.session[CHAT_SESSION_ID_KEY] = session_id
    _CHAT_HISTORY_STORE[session_id] = history[-20:]


def clear_chat_history(request: Request) -> None:
    session_id = request.session.get(CHAT_SESSION_ID_KEY)
    if isinstance(session_id, str):
        _CHAT_HISTORY_STORE.pop(session_id, None)
