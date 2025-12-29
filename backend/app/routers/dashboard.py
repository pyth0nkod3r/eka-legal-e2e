"""Dashboard router."""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.models import CLIENT_DASHBOARD_STATS, LAWYER_DASHBOARD_STATS, USERS

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/client/stats", response_model=ApiResponse)
async def get_client_stats(current_user: dict = Depends(get_current_user)):
    """Retrieve dashboard statistics for clients."""
    return ApiResponse(success=True, data=CLIENT_DASHBOARD_STATS)


@router.get("/lawyer/stats", response_model=ApiResponse)
async def get_lawyer_stats(current_user: dict = Depends(get_current_user)):
    """Retrieve dashboard statistics for lawyers."""
    user = USERS.get(current_user["sub"])
    
    # Check if user is a lawyer
    if user and user.get("role") == "lawyer":
        return ApiResponse(success=True, data=LAWYER_DASHBOARD_STATS)
    
    # Return client stats for non-lawyers
    return ApiResponse(success=True, data=CLIENT_DASHBOARD_STATS)
