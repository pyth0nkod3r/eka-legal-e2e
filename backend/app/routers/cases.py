"""Cases router."""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.schemas import ApiResponse, CaseStatus, CreateCaseRequest
from app.models import CASES, get_cases_by_client, get_all_cases, get_user_by_id, add_case

router = APIRouter(prefix="/cases", tags=["Cases"])


def is_admin_or_lawyer(user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = get_user_by_id(user_id)
    return user and user["role"] in ("admin", "lawyer")


@router.get("", response_model=ApiResponse)
async def get_my_cases(
    status: Optional[CaseStatus] = None,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve all cases for the authenticated user, or all cases for admin/lawyer."""
    if is_admin_or_lawyer(current_user["sub"]):
        cases = get_all_cases()
    else:
        cases = get_cases_by_client(current_user["sub"])
    
    if status:
        cases = [c for c in cases if c["status"] == status.value]
    
    return ApiResponse(success=True, data=cases)


@router.post("", response_model=ApiResponse, status_code=201)
async def create_case(
    data: CreateCaseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new case (admin/lawyer only)."""
    if not is_admin_or_lawyer(current_user["sub"]):
        raise HTTPException(status_code=403, detail="Not authorized to create cases")
    
    # Verify client exists
    client = get_user_by_id(data.client_id)
    if not client or client["role"] != "client":
        return ApiResponse(success=False, message="Client not found")
    
    now = datetime.now(timezone.utc).isoformat()
    new_case = {
        "id": f"case-{datetime.now(timezone.utc).timestamp():.0f}",
        "clientId": data.client_id,
        "title": data.title,
        "description": data.description,
        "status": "pending",
        "caseType": data.case_type,
        "createdAt": now,
        "updatedAt": now,
        "documents": [],
        "timeline": [
            {
                "id": f"event-{datetime.now(timezone.utc).timestamp():.0f}",
                "date": now,
                "title": "Case Opened",
                "description": "Case file created.",
                "type": "status",
            }
        ],
    }
    
    add_case(new_case)
    
    return ApiResponse(success=True, data=new_case, message="Case created successfully")


@router.get("/{case_id}", response_model=ApiResponse)
async def get_case_by_id(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve a specific case by its ID."""
    case = CASES.get(case_id)
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Admin/lawyer can view any case, clients can only view their own
    if not is_admin_or_lawyer(current_user["sub"]) and case["clientId"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    
    return ApiResponse(success=True, data=case)

