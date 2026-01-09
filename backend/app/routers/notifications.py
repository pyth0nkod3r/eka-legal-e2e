"""Notifications router."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.models import get_notifications_by_user, NOTIFICATIONS

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _get_unread_count(user_id: str) -> int:
    """Helper to get unread notification count for a user."""
    notifications = NOTIFICATIONS.get(user_id, [])
    return sum(1 for n in notifications if not n.get("read", False))


@router.get("", response_model=ApiResponse)
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Retrieve all notifications for the authenticated user."""
    notifications = get_notifications_by_user(current_user["sub"])
    return ApiResponse(success=True, data=notifications)


@router.get("/unread-count", response_model=ApiResponse)
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications."""
    user_id = current_user["sub"]
    unread_count = _get_unread_count(user_id)
    return ApiResponse(success=True, data={"unreadCount": unread_count})


@router.post("/{notification_id}/read", response_model=ApiResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a specific notification as read."""
    user_id = current_user["sub"]
    notifications = NOTIFICATIONS.get(user_id, [])
    
    for notif in notifications:
        if notif["id"] == notification_id:
            notif["read"] = True
            unread_count = _get_unread_count(user_id)
            return ApiResponse(
                success=True, 
                message="Notification marked as read",
                data={"unreadCount": unread_count}
            )
    
    raise HTTPException(status_code=404, detail="Notification not found")


@router.post("/read-all", response_model=ApiResponse)
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    user_id = current_user["sub"]
    notifications = NOTIFICATIONS.get(user_id, [])
    
    for notif in notifications:
        notif["read"] = True
    
    return ApiResponse(
        success=True, 
        message="All notifications marked as read",
        data={"unreadCount": 0}
    )

