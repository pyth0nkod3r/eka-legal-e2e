"""Booking router."""

from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.schemas import (
    ApiResponse,
    CreateBookingRequest,
    UpdateBookingStatusRequest,
    BookingStatus,
    UserRole,
)
from app.models.booking import Booking
from app.repositories import user as user_repo
from app.repositories import booking as booking_repo

router = APIRouter(prefix="/booking", tags=["Booking"])


async def is_admin_or_lawyer(db: AsyncSession, user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = await user_repo.get_user_by_id(db, user_id)
    return user and user.role in (UserRole.ADMIN, UserRole.LAWYER)


def get_time_slots(date: str) -> list:
    """Generate time slots for a given date."""
    times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
    return [
        {
            "id": f"slot-{date}-{i}",
            "date": date,
            "time": time,
            "available": i % 3 != 0,  # Some slots unavailable
        }
        for i, time in enumerate(times)
    ]


@router.get("/consultation-types", response_model=ApiResponse)
async def get_consultation_types(db: AsyncSession = Depends(get_db)):
    """Retrieve available consultation types with pricing."""
    consult_types = await booking_repo.get_consultation_types(db)
    return ApiResponse(success=True, data=[ct.to_dict() for ct in consult_types])


@router.get("/available-slots", response_model=ApiResponse)
async def get_available_slots(date: str):
    """Retrieve available booking slots for a specific date."""
    slots = get_time_slots(date)
    return ApiResponse(success=True, data=slots)


@router.get("/bookings", response_model=ApiResponse)
async def get_my_bookings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all bookings for the authenticated user, or all bookings for admin/lawyer."""
    user = await user_repo.get_user_by_id(db, current_user["sub"])
    if user and user.role in (UserRole.ADMIN, UserRole.LAWYER):
        bookings = await booking_repo.get_all_bookings(db)
    else:
        bookings = await booking_repo.get_bookings_by_client(db, current_user["sub"])
    return ApiResponse(success=True, data=[b.to_dict() for b in bookings])


@router.get("/appointments-week", response_model=ApiResponse)
async def get_weekly_appointments(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all appointments for the current week (admin/lawyer only)."""
    if not await is_admin_or_lawyer(db, current_user["sub"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to view weekly appointments"
        )

    # Get current date and calculate start/end of week (Monday to Sunday)
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    start_date_str = start_of_week.strftime("%Y-%m-%d")
    end_date_str = end_of_week.strftime("%Y-%m-%d")

    # Get all bookings and filter within the week
    all_bookings = await booking_repo.get_all_bookings(db)
    weekly_bookings = [
        b.to_dict() for b in all_bookings if start_date_str <= b.date <= end_date_str
    ]

    # Sort by date and time
    weekly_bookings.sort(key=lambda b: (b.get("date", ""), b.get("time", "")))

    return ApiResponse(success=True, data=weekly_bookings)


@router.post("/bookings", response_model=ApiResponse, status_code=201)
async def create_booking(
    data: CreateBookingRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Create a new consultation booking."""
    # Find the consultation type
    consult_type = await booking_repo.get_consultation_type_by_id(
        db, data.consultation_type_id
    )

    if not consult_type:
        return ApiResponse(success=False, message="Invalid consultation type")

    client_id = current_user["sub"] if current_user else None

    new_booking = Booking(
        id=f"booking-{datetime.now(timezone.utc).timestamp():.0f}",
        client_id=client_id,
        consultation_type_id=consult_type.id,
        client_name=data.name,
        client_email=data.email,
        date=data.date,
        time=data.time,
        status=BookingStatus.PENDING,
        reason=data.reason,
        created_at=datetime.now(timezone.utc),
    )

    await booking_repo.add_booking(db, new_booking)

    return ApiResponse(success=True, data=new_booking.to_dict())


@router.patch("/bookings/{booking_id}", response_model=ApiResponse)
async def update_booking_status(
    booking_id: str,
    data: UpdateBookingStatusRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a booking's status (admin/lawyer only)."""
    if not await is_admin_or_lawyer(db, current_user["sub"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to update booking status"
        )

    booking = await booking_repo.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    await booking_repo.update_booking(db, booking_id, status=data.status)
    booking = await booking_repo.get_booking_by_id(db, booking_id)

    # Create notification for client if they have an account
    if booking.client_id:
        from uuid import uuid4
        from app.models.notification import Notification
        from app.repositories import notification as notification_repo
        from app.schemas import NotificationType

        status_text = (
            data.status.value if hasattr(data.status, "value") else str(data.status)
        )
        new_notification = Notification(
            id=f"notif-{uuid4()}",
            user_id=booking.client_id,
            title="Appointment Status Updated",
            message=f"Your appointment on {booking.date} at {booking.time} has been {status_text}.",
            type=NotificationType.APPOINTMENT,
            link="/dashboard/appointments",
            read=False,
            created_at=datetime.now(timezone.utc),
        )
        await notification_repo.add_notification(db, new_notification)

    return ApiResponse(
        success=True, data=booking.to_dict(), message="Booking status updated"
    )


@router.delete("/bookings/{booking_id}", response_model=ApiResponse)
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel an existing booking."""
    booking = await booking_repo.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Allow owner OR admin/lawyer to cancel
    if booking.client_id != current_user["sub"] and not await is_admin_or_lawyer(
        db, current_user["sub"]
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to cancel this booking"
        )

    await booking_repo.update_booking(db, booking_id, status=BookingStatus.CANCELLED)

    return ApiResponse(success=True, message="Booking cancelled")
