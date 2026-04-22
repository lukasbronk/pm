from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Project Management MVP"
    host: str = "127.0.0.1"
    port: int = 8000
    session_secret: str = "local-dev-session-secret"
    db_path: str = str(Path("backend") / "data" / "pm.sqlite3")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
