"""Dashboard router."""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import ApiResponse, UserRole, CaseStatus, BookingStatus
from app.repositories import user as user_repo
from app.repositories import case as case_repo
from app.repositories import booking as booking_repo

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


async def calculate_lawyer_stats(db: AsyncSession) -> dict:
    """Calculate real dashboard statistics for lawyers."""
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())  # Monday

    # Count total clients
    clients = await user_repo.get_clients(db)
    total_clients = len(clients)

    # Count active cases and pending cases
    all_cases = await case_repo.get_all_cases(db)
    active_cases = len([c for c in all_cases if c.status == CaseStatus.ACTIVE])
    pending_cases = len([c for c in all_cases if c.status == CaseStatus.PENDING])

    # Count pending documents across all cases
    pending_documents = sum(len(case.documents) for case in all_cases)

    # Count upcoming appointments (confirmed or pending, date >= today)
    all_bookings = await booking_repo.get_all_bookings(db)
    upcoming_appointments = 0
    appointments_this_week = [
        {"day": "Mon", "count": 0},
        {"day": "Tue", "count": 0},
        {"day": "Wed", "count": 0},
        {"day": "Thu", "count": 0},
        {"day": "Fri", "count": 0},
        {"day": "Sat", "count": 0},
        {"day": "Sun", "count": 0},
    ]

    for booking in all_bookings:
        if booking.status in [BookingStatus.CONFIRMED, BookingStatus.PENDING]:
            try:
                # Booking date is stored as YYYY-MM-DD string
                booking_date = datetime.strptime(booking.date, "%Y-%m-%d").date()
                if booking_date >= today:
                    upcoming_appointments += 1

                # Check if booking is in current week
                if week_start <= booking_date < week_start + timedelta(days=7):
                    day_index = booking_date.weekday()
                    if day_index < 7:  # Monday to Sunday
                        appointments_this_week[day_index]["count"] += 1
            except (ValueError, AttributeError):
                pass

    # Calculate monthly cases trend (last 6 months)
    monthly_cases = []
    # Create list of last 6 months
    for i in range(5, -1, -1):
        target_date = today - timedelta(days=i * 30)  # Approx
        month_name = target_date.strftime("%b")
        # Filter cases created in this month (simple approximation matching month/year)
        count = 0
        for case in all_cases:
            if case.created_at:
                case_date = case.created_at.date()
                if (
                    case_date.month == target_date.month
                    and case_date.year == target_date.year
                ):
                    count += 1

        monthly_cases.append({"month": month_name, "count": count})

    return {
        "totalClients": total_clients,
        "activeCase": active_cases,
        "pendingCases": pending_cases,
        "upcomingAppointments": upcoming_appointments,
        "pendingDocuments": pending_documents,
        "appointmentsThisWeek": appointments_this_week,
        "monthlyCases": monthly_cases,
    }


async def calculate_client_stats(db: AsyncSession, user_id: str) -> dict:
    """Calculate dashboard statistics for a specific client."""
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())

    # Get client's cases
    cases = await case_repo.get_cases_by_client(db, user_id)
    active_cases = len([c for c in cases if c.status == CaseStatus.ACTIVE])

    # Get client's bookings
    bookings = await booking_repo.get_bookings_by_client(db, user_id)

    upcoming_appointments = 0
    appointments_this_week = [
        {"day": "Mon", "count": 0},
        {"day": "Tue", "count": 0},
        {"day": "Wed", "count": 0},
        {"day": "Thu", "count": 0},
        {"day": "Fri", "count": 0},
    ]

    for booking in bookings:
        if booking.status in [BookingStatus.CONFIRMED, BookingStatus.PENDING]:
            try:
                booking_date = datetime.strptime(booking.date, "%Y-%m-%d").date()
                if booking_date >= today:
                    upcoming_appointments += 1

                if week_start <= booking_date < week_start + timedelta(days=7):
                    day_index = booking_date.weekday()
                    if day_index < 5:
                        appointments_this_week[day_index]["count"] += 1
            except (ValueError, AttributeError):
                pass

    # Count documents
    pending_documents = sum(len(case.documents) for case in cases)

    return {
        "totalClients": 1,
        "activeCase": active_cases,
        "upcomingAppointments": upcoming_appointments,
        "pendingDocuments": pending_documents,
        "appointmentsThisWeek": appointments_this_week,
    }


@router.get("/client/stats", response_model=ApiResponse)
async def get_client_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve dashboard statistics for clients."""
    stats = await calculate_client_stats(db, current_user["sub"])
    return ApiResponse(success=True, data=stats)


@router.get("/lawyer/stats", response_model=ApiResponse)
async def get_lawyer_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve dashboard statistics for lawyers."""
    user = await user_repo.get_user_by_id(db, current_user["sub"])

    # Check if user is a lawyer or admin
    if user and user.role in (UserRole.LAWYER, UserRole.ADMIN):
        stats = await calculate_lawyer_stats(db)
        return ApiResponse(success=True, data=stats)

    # Return client stats for non-lawyers
    stats = await calculate_client_stats(db, current_user["sub"])
    return ApiResponse(success=True, data=stats)


@router.get("/search", response_model=ApiResponse)
async def search_dashboard(
    q: str = "",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search clients and cases for dashboard (admin/lawyer only)."""
    user = await user_repo.get_user_by_id(db, current_user["sub"])

    # Only allow admin or lawyer
    if not user or user.role not in (UserRole.LAWYER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    query = q.lower().strip() if q else ""

    # Get all clients
    clients = await user_repo.get_clients(db)
    if query:
        clients = [
            c for c in clients if query in c.name.lower() or query in c.email.lower()
        ]

    # Get all cases
    all_cases = await case_repo.get_all_cases(db)

    # Build case results with client name
    case_results = []
    for case in all_cases:
        # Get client name for the case
        client = await user_repo.get_user_by_id(db, case.client_id)
        client_name = client.name if client else "Unknown"
        case_dict = case.to_dict()
        case_dict["clientName"] = client_name

        if query:
            # Filter by title, client name, or case type
            if (
                query in case.title.lower()
                or query in client_name.lower()
                or query in case.case_type.lower()
            ):
                case_results.append(case_dict)
        else:
            case_results.append(case_dict)

    return ApiResponse(
        success=True,
        data={
            "clients": [c.to_dict() for c in clients],
            "cases": case_results,
        },
    )
