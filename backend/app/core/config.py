"""Core configuration and settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(env_file=".env")
    
    app_name: str = "Eka Legal API"
    debug: bool = True
    
    # Database Settings
    database_url: str = "sqlite+aiosqlite:///./eka_legal.db"
    database_echo: bool = False
    
    # JWT Settings
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


@lru_cache
def get_settings() -> Settings:
    return Settings()
