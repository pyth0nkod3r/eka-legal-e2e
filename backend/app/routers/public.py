"""Public content router."""

from fastapi import APIRouter

from app.schemas import ApiResponse, ContactFormData
from app.models import LAWYER_PROFILE, SERVICES, TESTIMONIALS, FAQS

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/lawyer-profile", response_model=ApiResponse)
async def get_lawyer_profile():
    """Retrieve the lawyer's public profile information."""
    return ApiResponse(success=True, data=LAWYER_PROFILE)


@router.get("/services", response_model=ApiResponse)
async def get_services():
    """Retrieve all available legal services."""
    return ApiResponse(success=True, data=SERVICES)


@router.get("/testimonials", response_model=ApiResponse)
async def get_testimonials():
    """Retrieve client testimonials."""
    return ApiResponse(success=True, data=TESTIMONIALS)


@router.get("/faqs", response_model=ApiResponse)
async def get_faqs():
    """Retrieve frequently asked questions."""
    return ApiResponse(success=True, data=FAQS)


@router.post("/contact", response_model=ApiResponse)
async def submit_contact_form(data: ContactFormData):
    """Submit a contact inquiry."""
    # In a real implementation, you would save the contact and send notifications
    return ApiResponse(
        success=True,
        message="Thank you for your message. We will get back to you soon.",
    )
