"""Notifications router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.repositories import notification as notification_repo

router = APIRouter(prefix="/notifications", tags=["Notifications"])


async def _get_unread_count(db: AsyncSession, user_id: str) -> int:
    """Helper to get unread notification count for a user."""
    notifications = await notification_repo.get_notifications_by_user(db, user_id)
    return sum(1 for n in notifications if not n.read)


@router.get("", response_model=ApiResponse)
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all notifications for the authenticated user."""
    notifications = await notification_repo.get_notifications_by_user(
        db, current_user["sub"]
    )
    return ApiResponse(success=True, data=[n.to_dict() for n in notifications])


@router.get("/unread-count", response_model=ApiResponse)
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get count of unread notifications."""
    user_id = current_user["sub"]
    unread_count = await _get_unread_count(db, user_id)
    return ApiResponse(success=True, data={"unreadCount": unread_count})


@router.post("/{notification_id}/read", response_model=ApiResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a specific notification as read."""
    user_id = current_user["sub"]

    notification = await notification_repo.mark_notification_read(db, notification_id)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    unread_count = await _get_unread_count(db, user_id)
    return ApiResponse(
        success=True,
        message="Notification marked as read",
        data={"unreadCount": unread_count},
    )


@router.post("/read-all", response_model=ApiResponse)
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all notifications as read."""
    user_id = current_user["sub"]

    await notification_repo.mark_all_notifications_read(db, user_id)

    return ApiResponse(
        success=True,
        message="All notifications marked as read",
        data={"unreadCount": 0},
    )
