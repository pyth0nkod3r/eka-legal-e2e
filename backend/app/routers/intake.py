"""Intake form router."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas import ApiResponse, IntakeFormData

router = APIRouter(prefix="/intake", tags=["Intake"])

# In-memory storage for intake drafts (temporary session data)
# This is intentionally kept in-memory as drafts are ephemeral session data
INTAKE_DRAFTS: dict = {}


@router.post("", response_model=ApiResponse, status_code=201)
async def submit_intake_form(data: IntakeFormData):
    """Submit a client intake form to request legal consultation."""
    # Create a new case ID
    case_id = f"case-{datetime.now(timezone.utc).timestamp():.0f}"

    # In a real implementation, this would create a case and notify the lawyer

    return ApiResponse(
        success=True,
        data={"caseId": case_id},
        message="Your consultation request has been submitted successfully.",
    )


@router.get("/draft", response_model=ApiResponse)
async def get_intake_draft(current_user: dict = Depends(get_current_user)):
    """Retrieve saved intake form draft."""
    user_id = current_user["sub"]
    draft = INTAKE_DRAFTS.get(user_id)

    return ApiResponse(success=True, data=draft)


@router.post("/draft", response_model=ApiResponse)
async def save_intake_draft(
    data: IntakeFormData,
    current_user: dict = Depends(get_current_user),
):
    """Save intake form progress as a draft."""
    user_id = current_user["sub"]

    # Convert to dict for storage
    INTAKE_DRAFTS[user_id] = data.model_dump(by_alias=True)

    return ApiResponse(success=True, message="Draft saved")
