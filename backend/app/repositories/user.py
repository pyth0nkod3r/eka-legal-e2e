"""Repository for User database operations."""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas import UserRole


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Find user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Find user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def add_user(db: AsyncSession, user: User) -> User:
    """Add a new user."""
    db.add(user)
    await db.flush()
    return user


async def get_all_users(db: AsyncSession) -> List[User]:
    """Get all users."""
    result = await db.execute(select(User))
    return list(result.scalars().all())


async def get_clients(db: AsyncSession) -> List[User]:
    """Get all client users."""
    result = await db.execute(select(User).where(User.role == UserRole.CLIENT))
    return list(result.scalars().all())


async def update_user(db: AsyncSession, user_id: str, **kwargs) -> Optional[User]:
    """Update user fields."""
    user = await get_user_by_id(db, user_id)
    if user:
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        await db.flush()
    return user
