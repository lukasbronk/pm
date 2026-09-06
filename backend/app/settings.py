from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_SESSION_SECRET = "local-dev-session-secret"
LOCAL_HOSTS = {"127.0.0.1", "localhost"}


class Settings(BaseSettings):
    app_name: str = "Project Management MVP"
    host: str = "127.0.0.1"
    port: int = 8000
    session_secret: str = DEFAULT_SESSION_SECRET
    db_path: str = str(Path("backend") / "data" / "pm.sqlite3")
    openai_api_key: str = ""
    openai_model: str = "gpt-5.2"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def require_real_secret_off_localhost(self) -> "Settings":
        if self.host not in LOCAL_HOSTS and self.session_secret == DEFAULT_SESSION_SECRET:
            raise ValueError(
                "SESSION_SECRET must be set in .env before binding to a non-localhost host."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
