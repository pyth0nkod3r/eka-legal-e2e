"""Dashboard router."""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.models import (
    CLIENT_DASHBOARD_STATS,
    LAWYER_DASHBOARD_STATS,
    USERS,
    CASES,
    BOOKINGS,
    get_clients,
    get_all_cases,
    get_all_bookings,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def calculate_lawyer_stats() -> dict:
    """Calculate real dashboard statistics for lawyers."""
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())  # Monday
    
    # Count total clients
    total_clients = len(get_clients())
    
    # Count active cases and pending cases
    all_cases = get_all_cases()
    active_cases = len([c for c in all_cases if c["status"] == "active"])
    pending_cases = len([c for c in all_cases if c["status"] == "pending"])
    
    # Count upcoming appointments (confirmed or pending, date >= today)
    all_bookings = get_all_bookings()
    upcoming_appointments = 0
    for booking in all_bookings:
        if booking["status"] in ["confirmed", "pending"]:
            try:
                booking_date = datetime.fromisoformat(booking["date"].replace('Z', '+00:00')).date()
                if booking_date >= today:
                    upcoming_appointments += 1
            except:
                # If date parsing fails, just try string comparison
                if booking["date"] >= str(today):
                    upcoming_appointments += 1
    
    # Count pending documents across all cases
    pending_documents = sum(len(case.get("documents", [])) for case in all_cases)
    
    # Calculate appointments by day of week for this week
    appointments_this_week = [
        {"day": "Mon", "count": 0},
        {"day": "Tue", "count": 0},
        {"day": "Wed", "count": 0},
        {"day": "Thu", "count": 0},
        {"day": "Fri", "count": 0},
    ]
    
    for booking in all_bookings:
        try:
            booking_date = datetime.fromisoformat(booking["date"].replace('Z', '+00:00')).date()
            # Check if booking is in current week
            if week_start <= booking_date < week_start + timedelta(days=7):
                day_index = booking_date.weekday()
                if day_index < 5:  # Monday to Friday
                    appointments_this_week[day_index]["count"] += 1
        except:
            pass
    
    return {
        "totalClients": total_clients,
        "activeCase": active_cases,
        "pendingCases": pending_cases,
        "upcomingAppointments": upcoming_appointments,
        "pendingDocuments": pending_documents,
        "appointmentsThisWeek": appointments_this_week,
    }


@router.get("/client/stats", response_model=ApiResponse)
async def get_client_stats(current_user: dict = Depends(get_current_user)):
    """Retrieve dashboard statistics for clients."""
    return ApiResponse(success=True, data=CLIENT_DASHBOARD_STATS)


@router.get("/lawyer/stats", response_model=ApiResponse)
async def get_lawyer_stats(current_user: dict = Depends(get_current_user)):
    """Retrieve dashboard statistics for lawyers."""
    user = USERS.get(current_user["sub"])
    
    # Check if user is a lawyer
    if user and user.get("role") in ("lawyer", "admin"):
        stats = calculate_lawyer_stats()
        return ApiResponse(success=True, data=stats)
    
    # Return client stats for non-lawyers
    return ApiResponse(success=True, data=CLIENT_DASHBOARD_STATS)
