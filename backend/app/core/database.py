"""Database configuration and session management."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""

    pass


settings = get_settings()


def _create_engine():
    """Create async engine with appropriate settings for database type."""
    engine_kwargs = {
        "echo": settings.database_echo,
    }

    if settings.is_sqlite:
        # SQLite-specific configuration
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    elif settings.is_postgres:
        # PostgreSQL-specific configuration with connection pooling
        engine_kwargs["pool_size"] = settings.db_pool_size
        engine_kwargs["max_overflow"] = settings.db_max_overflow
        engine_kwargs["pool_pre_ping"] = True  # Enable connection health checks

    return create_async_engine(settings.database_url, **engine_kwargs)


# Create async engine
engine = _create_engine()

# Create session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Initialize database, creating all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()
