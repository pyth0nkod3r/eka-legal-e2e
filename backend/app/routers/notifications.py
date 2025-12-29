"""Notifications router."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.models import get_notifications_by_user, NOTIFICATIONS

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=ApiResponse)
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Retrieve all notifications for the authenticated user."""
    notifications = get_notifications_by_user(current_user["sub"])
    return ApiResponse(success=True, data=notifications)


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
            return ApiResponse(success=True, message="Notification marked as read")
    
    raise HTTPException(status_code=404, detail="Notification not found")


@router.post("/read-all", response_model=ApiResponse)
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    user_id = current_user["sub"]
    notifications = NOTIFICATIONS.get(user_id, [])
    
    for notif in notifications:
        notif["read"] = True
    
    return ApiResponse(success=True, message="All notifications marked as read")
