"""Core configuration and settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "Eka Legal API"
    debug: bool = True

    # Database Settings
    # Default: SQLite for development
    # Production: Set DATABASE_URL to postgresql+asyncpg://user:pass@host/db
    database_url: str = "sqlite+aiosqlite:///./eka_legal.db"
    database_echo: bool = False

    # PostgreSQL connection pool settings (ignored for SQLite)
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # JWT Settings
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return self.database_url.startswith("sqlite")

    @property
    def is_postgres(self) -> bool:
        """Check if using PostgreSQL database."""
        return self.database_url.startswith("postgresql")


@lru_cache
def get_settings() -> Settings:
    return Settings()
