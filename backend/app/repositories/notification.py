"""Repository for Notification database operations."""

from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def get_notifications_by_user(db: AsyncSession, user_id: str) -> List[Notification]:
    """Get all notifications for a user."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    return list(result.scalars().all())


async def add_notification(db: AsyncSession, notification: Notification) -> Notification:
    """Add a new notification."""
    db.add(notification)
    await db.flush()
    return notification


async def mark_notification_read(db: AsyncSession, notification_id: str) -> bool:
    """Mark a notification as read."""
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    if notification:
        notification.read = True
        await db.flush()
        return True
    return False


async def mark_all_notifications_read(db: AsyncSession, user_id: str) -> int:
    """Mark all notifications as read for a user. Returns count."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .where(Notification.read == False)
    )
    notifications = result.scalars().all()
    for notification in notifications:
        notification.read = True
    await db.flush()
    return len(notifications)
