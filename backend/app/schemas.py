from pydantic import BaseModel


class LoginPayload(BaseModel):
    username: str
    password: str


class BoardPayload(BaseModel):
    viewMode: str | None = None
    themeId: str | None = None
    playerProfile: dict | None = None
    drawSettings: dict | None = None
    runState: dict | None = None
    columns: list[dict]
    cards: dict


class AIChatPayload(BaseModel):
    message: str
