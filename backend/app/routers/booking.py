"""Booking router."""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user, get_current_user_optional
from app.schemas import ApiResponse, CreateBookingRequest, UpdateBookingStatusRequest
from app.models import (
    CONSULTATION_TYPES,
    BOOKINGS,
    get_time_slots,
    get_bookings_by_client,
    get_all_bookings,
    get_user_by_id,
)

router = APIRouter(prefix="/booking", tags=["Booking"])


def is_admin_or_lawyer(user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = get_user_by_id(user_id)
    return user and user["role"] in ("admin", "lawyer")


@router.get("/consultation-types", response_model=ApiResponse)
async def get_consultation_types():
    """Retrieve available consultation types with pricing."""
    return ApiResponse(success=True, data=CONSULTATION_TYPES)


@router.get("/available-slots", response_model=ApiResponse)
async def get_available_slots(date: str):
    """Retrieve available booking slots for a specific date."""
    slots = get_time_slots(date)
    return ApiResponse(success=True, data=slots)


@router.get("/bookings", response_model=ApiResponse)
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    """Retrieve all bookings for the authenticated user, or all bookings for admin/lawyer."""
    user = get_user_by_id(current_user["sub"])
    if user and user["role"] in ("admin", "lawyer"):
        bookings = get_all_bookings()
    else:
        bookings = get_bookings_by_client(current_user["sub"])
    return ApiResponse(success=True, data=bookings)


@router.get("/appointments-week", response_model=ApiResponse)
async def get_weekly_appointments(current_user: dict = Depends(get_current_user)):
    """Retrieve all appointments for the current week (admin/lawyer only)."""
    if not is_admin_or_lawyer(current_user["sub"]):
        raise HTTPException(status_code=403, detail="Not authorized to view weekly appointments")
    
    from datetime import datetime, timedelta
    
    # Get current date and calculate start/end of week (Monday to Sunday)
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    start_date_str = start_of_week.strftime("%Y-%m-%d")
    end_date_str = end_of_week.strftime("%Y-%m-%d")
    
    # Filter bookings within the week
    all_bookings = get_all_bookings()
    weekly_bookings = [
        b for b in all_bookings
        if start_date_str <= b.get("date", "") <= end_date_str
    ]
    
    # Sort by date and time
    weekly_bookings.sort(key=lambda b: (b.get("date", ""), b.get("time", "")))
    
    return ApiResponse(success=True, data=weekly_bookings)


@router.post("/bookings", response_model=ApiResponse, status_code=201)
async def create_booking(
    data: CreateBookingRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Create a new consultation booking."""
    # Find the consultation type
    consult_type = None
    for ct in CONSULTATION_TYPES:
        if ct["id"] == data.consultation_type_id:
            consult_type = ct
            break
    
    if not consult_type:
        return ApiResponse(success=False, message="Invalid consultation type")
    
    client_id = current_user["sub"] if current_user else "guest"
    
    new_booking = {
        "id": f"booking-{datetime.now(timezone.utc).timestamp():.0f}",
        "clientId": client_id,
        "clientName": data.name,
        "clientEmail": data.email,
        "consultationType": consult_type,
        "date": data.date,
        "time": data.time,
        "status": "pending",
        "reason": data.reason,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    
    BOOKINGS[new_booking["id"]] = new_booking
    
    return ApiResponse(success=True, data=new_booking)


@router.patch("/bookings/{booking_id}", response_model=ApiResponse)
async def update_booking_status(
    booking_id: str,
    data: UpdateBookingStatusRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a booking's status (admin/lawyer only)."""
    if not is_admin_or_lawyer(current_user["sub"]):
        raise HTTPException(status_code=403, detail="Not authorized to update booking status")
    
    if booking_id not in BOOKINGS:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = BOOKINGS[booking_id]
    booking["status"] = data.status.value
    
    return ApiResponse(success=True, data=booking, message="Booking status updated")


@router.delete("/bookings/{booking_id}", response_model=ApiResponse)
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel an existing booking."""
    if booking_id not in BOOKINGS:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = BOOKINGS[booking_id]
    # Allow owner OR admin/lawyer to cancel
    if booking["clientId"] != current_user["sub"] and not is_admin_or_lawyer(current_user["sub"]):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    
    booking["status"] = "cancelled"
    
    return ApiResponse(success=True, message="Booking cancelled")

