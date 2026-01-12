"""Cases router."""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import (
    ApiResponse,
    CaseStatus,
    CreateCaseRequest,
    UpdateCaseStatusRequest,
    TimelineEventType,
    UserRole,
)
from app.models.case import Case, TimelineEvent
from app.repositories import user as user_repo
from app.repositories import case as case_repo

router = APIRouter(prefix="/cases", tags=["Cases"])


async def is_admin_or_lawyer(db: AsyncSession, user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = await user_repo.get_user_by_id(db, user_id)
    return user and user.role in (UserRole.ADMIN, UserRole.LAWYER)


async def enrich_case_with_client_name(db: AsyncSession, case: Case) -> dict:
    """Add clientName to case data by looking up the client."""
    case_dict = case.to_dict()
    client = await user_repo.get_user_by_id(db, case.client_id)
    case_dict["clientName"] = client.name if client else "Unknown Client"
    return case_dict


@router.get("", response_model=ApiResponse)
async def get_my_cases(
    status: Optional[CaseStatus] = None,
    client_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all cases for the authenticated user, or all cases for admin/lawyer.

    Admin/lawyer can filter by client_id to see only a specific client's cases.
    """
    if await is_admin_or_lawyer(db, current_user["sub"]):
        if client_id:
            # Admin/lawyer filtering by specific client
            cases = await case_repo.get_cases_by_client(db, client_id)
        else:
            cases = await case_repo.get_all_cases(db)
    else:
        cases = await case_repo.get_cases_by_client(db, current_user["sub"])

    if status:
        cases = [c for c in cases if c.status == status]

    # Enrich with client names
    enriched_cases = [await enrich_case_with_client_name(db, c) for c in cases]

    return ApiResponse(success=True, data=enriched_cases)


@router.post("", response_model=ApiResponse, status_code=201)
async def create_case(
    data: CreateCaseRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new case (admin/lawyer only)."""
    if not await is_admin_or_lawyer(db, current_user["sub"]):
        raise HTTPException(status_code=403, detail="Not authorized to create cases")

    # Verify client exists
    client = await user_repo.get_user_by_id(db, data.client_id)
    if not client or client.role != UserRole.CLIENT:
        return ApiResponse(success=False, message="Client not found")

    now = datetime.now(timezone.utc)
    case_id = f"case-{now.timestamp():.0f}"

    new_case = Case(
        id=case_id,
        client_id=data.client_id,
        title=data.title,
        description=data.description,
        status=CaseStatus.PENDING,
        case_type=data.case_type,
        created_at=now,
        updated_at=now,
    )

    await case_repo.add_case(db, new_case)

    # Add initial timeline event
    timeline_event = TimelineEvent(
        id=f"event-{now.timestamp():.0f}",
        case_id=case_id,
        date=now,
        title="Case Opened",
        description="Case file created.",
        type=TimelineEventType.STATUS,
    )
    await case_repo.add_timeline_event(db, timeline_event)

    case_dict = await enrich_case_with_client_name(db, new_case)
    return ApiResponse(
        success=True, data=case_dict, message="Case created successfully"
    )


@router.get("/{case_id}", response_model=ApiResponse)
async def get_case_by_id_route(
    case_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a specific case by its ID."""
    case = await case_repo.get_case_by_id(db, case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Admin/lawyer can view any case, clients can only view their own
    if (
        not await is_admin_or_lawyer(db, current_user["sub"])
        and case.client_id != current_user["sub"]
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this case")

    case_dict = await enrich_case_with_client_name(db, case)
    return ApiResponse(success=True, data=case_dict)


@router.patch("/{case_id}", response_model=ApiResponse)
async def update_case_status(
    case_id: str,
    data: UpdateCaseStatusRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a case's status (admin/lawyer only)."""
    if not await is_admin_or_lawyer(db, current_user["sub"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to update case status"
        )

    case = await case_repo.get_case_by_id(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    old_status = case.status
    now = datetime.now(timezone.utc)

    # Update case status
    await case_repo.update_case(db, case_id, status=data.status, updated_at=now)

    # Add timeline event for status change
    timeline_event = TimelineEvent(
        id=f"event-{now.timestamp():.0f}",
        case_id=case_id,
        date=now,
        title="Status Changed",
        description=f"Case status changed from {old_status.value if hasattr(old_status, 'value') else old_status} to {data.status.value}.",
        type=TimelineEventType.STATUS,
    )
    await case_repo.add_timeline_event(db, timeline_event)

    # Create notification for client
    from uuid import uuid4
    from app.models.notification import Notification
    from app.repositories import notification as notification_repo
    from app.schemas import NotificationType

    status_text = (
        data.status.value if hasattr(data.status, "value") else str(data.status)
    )
    new_notification = Notification(
        id=f"notif-{uuid4()}",
        user_id=case.client_id,
        title="Case Status Updated",
        message=f"Your case '{case.title}' status has been changed to {status_text}.",
        type=NotificationType.CASE,
        link=f"/dashboard/cases/{case_id}",
        read=False,
        created_at=now,
    )
    await notification_repo.add_notification(db, new_notification)

    # Refresh case data
    case = await case_repo.get_case_by_id(db, case_id)
    case_dict = await enrich_case_with_client_name(db, case)
    return ApiResponse(success=True, data=case_dict, message="Case status updated")
