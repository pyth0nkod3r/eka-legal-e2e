from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.schemas import (
    ApiResponse,
    CreateBookingRequest,
    UpdateBookingStatusRequest,
    RescheduleBookingRequest,
    UpdateVideoUrlRequest,
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


def generate_video_url(booking_id: str, provider: str = "zoom", custom_url: Optional[str] = None) -> str:
    """Generate default video call link based on provider (Zoom default, Google Meet, Jitsi)."""
    if custom_url and custom_url.strip():
        return custom_url.strip()
    
    clean_id = booking_id.replace("booking-", "").replace(".", "")
    if provider == "google_meet":
        part1 = clean_id[:3].lower() if len(clean_id) >= 3 else "eka"
        part2 = clean_id[3:7].lower() if len(clean_id) >= 7 else "meet"
        part3 = clean_id[7:10].lower() if len(clean_id) >= 10 else "call"
        return f"https://meet.google.com/{part1}-{part2}-{part3}"
    elif provider == "jitsi":
        return f"https://meet.jit.si/eka-legal-{clean_id}"
    else:  # Default to Zoom
        meeting_num = clean_id[:10] if len(clean_id) >= 10 else f"849{clean_id}"
        return f"https://zoom.us/j/{meeting_num}?pwd=EkaLegalConsultation"


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
        user_email = user.email if user else current_user.get("email")
        bookings = await booking_repo.get_bookings_by_client(db, current_user["sub"], email=user_email)
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
    consult_type = await booking_repo.get_consultation_type_by_id(
        db, data.consultation_type_id
    )

    if not consult_type:
        return ApiResponse(success=False, message="Invalid consultation type")

    client_id = current_user["sub"] if current_user else None
    booking_id = f"booking-{datetime.now(timezone.utc).timestamp():.0f}"
    default_video_url = generate_video_url(booking_id, "zoom")

    new_booking = Booking(
        id=booking_id,
        client_id=client_id,
        consultation_type_id=consult_type.id,
        client_name=data.name,
        client_email=data.email,
        date=data.date,
        time=data.time,
        status=BookingStatus.PENDING,
        reason=data.reason,
        video_url=default_video_url,
        video_provider="zoom",
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

    update_fields = {"status": data.status}
    if not booking.video_url:
        update_fields["video_url"] = generate_video_url(booking.id, "zoom")
        update_fields["video_provider"] = "zoom"

    await booking_repo.update_booking(db, booking_id, **update_fields)
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
            message=f"Your appointment on {booking.date} at {booking.time} has been {status_text}. Video Link: {booking.video_url}",
            type=NotificationType.APPOINTMENT,
            link="/dashboard/appointments",
            read=False,
            created_at=datetime.now(timezone.utc),
        )
        await notification_repo.add_notification(db, new_notification)

    return ApiResponse(
        success=True, data=booking.to_dict(), message="Booking status updated"
    )


@router.patch("/bookings/{booking_id}/reschedule", response_model=ApiResponse)
async def reschedule_booking(
    booking_id: str,
    data: RescheduleBookingRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reschedule an existing booking to a new date and time."""
    booking = await booking_repo.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Allow client owner OR admin/lawyer
    is_admin = await is_admin_or_lawyer(db, current_user["sub"])
    if booking.client_id != current_user["sub"] and not is_admin:
        raise HTTPException(
            status_code=403, detail="Not authorized to reschedule this booking"
        )

    await booking_repo.update_booking(
        db, booking_id, date=data.date, time=data.time, status=BookingStatus.PENDING if not is_admin else booking.status
    )
    updated_booking = await booking_repo.get_booking_by_id(db, booking_id)

    # Create notification
    if updated_booking.client_id:
        from uuid import uuid4
        from app.models.notification import Notification
        from app.repositories import notification as notification_repo
        from app.schemas import NotificationType

        new_notification = Notification(
            id=f"notif-{uuid4()}",
            user_id=updated_booking.client_id,
            title="Appointment Rescheduled",
            message=f"Your appointment has been rescheduled to {updated_booking.date} at {updated_booking.time}.",
            type=NotificationType.APPOINTMENT,
            link="/dashboard/appointments",
            read=False,
            created_at=datetime.now(timezone.utc),
        )
        await notification_repo.add_notification(db, new_notification)

    return ApiResponse(
        success=True, data=updated_booking.to_dict(), message="Appointment rescheduled successfully"
    )


@router.post("/bookings/{booking_id}/video-link", response_model=ApiResponse)
async def update_video_link(
    booking_id: str,
    data: UpdateVideoUrlRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update or generate video call link for a booking (admin/lawyer only)."""
    if not await is_admin_or_lawyer(db, current_user["sub"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to update video call link"
        )

    booking = await booking_repo.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    provider = data.video_provider or "zoom"
    video_url = generate_video_url(booking.id, provider=provider, custom_url=data.video_url)

    await booking_repo.update_booking(
        db, booking_id, video_url=video_url, video_provider=provider
    )
    updated_booking = await booking_repo.get_booking_by_id(db, booking_id)

    return ApiResponse(
        success=True, data=updated_booking.to_dict(), message="Video call link updated successfully"
    )


@router.get("/bookings/{booking_id}/ics")
async def download_ics_calendar(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Export appointment to iCalendar (.ics) format."""
    booking = await booking_repo.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Format date and time
    dt_start_str = f"{booking.date.replace('-', '')}T{booking.time.replace(':', '')}00"
    duration = booking.consultation_type.duration if booking.consultation_type else 30
    
    # Calculate end time approximation
    try:
        start_dt = datetime.strptime(f"{booking.date} {booking.time}", "%Y-%m-%d %H:%M")
        end_dt = start_dt + timedelta(minutes=duration)
        dt_end_str = end_dt.strftime("%Y%m%dT%H%M%S")
    except Exception:
        dt_end_str = dt_start_str

    title = f"Eka Legal Consultation - {booking.consultation_type.name if booking.consultation_type else 'Appointment'}"
    summary = f"Legal Consultation for {booking.client_name}"
    location = booking.video_url or "Online Video Call"

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Eka Legal//Consultation Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{booking.id}@ekalegal.com
DTSTAMP:{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{dt_start_str}
DTEND:{dt_end_str}
SUMMARY:{title}
DESCRIPTION:{summary}\\nReason: {booking.reason}\\nVideo Link: {location}
LOCATION:{location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f'attachment; filename="appointment-{booking_id}.ics"'},
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

