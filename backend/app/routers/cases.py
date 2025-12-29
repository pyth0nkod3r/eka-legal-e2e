"""Cases router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.schemas import ApiResponse, CaseStatus
from app.models import CASES, get_cases_by_client

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get("", response_model=ApiResponse)
async def get_my_cases(
    status: Optional[CaseStatus] = None,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve all cases for the authenticated user."""
    cases = get_cases_by_client(current_user["sub"])
    
    if status:
        cases = [c for c in cases if c["status"] == status.value]
    
    return ApiResponse(success=True, data=cases)


@router.get("/{case_id}", response_model=ApiResponse)
async def get_case_by_id(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve a specific case by its ID."""
    case = CASES.get(case_id)
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if case["clientId"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    
    return ApiResponse(success=True, data=case)
