"""Public content router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import ApiResponse, ContactFormData
from app.repositories import content as content_repo

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/lawyer-profile", response_model=ApiResponse)
async def get_lawyer_profile(db: AsyncSession = Depends(get_db)):
    """Retrieve the lawyer's public profile information."""
    profile = await content_repo.get_lawyer_profile(db)
    if not profile:
        return ApiResponse(success=True, data=None)
    return ApiResponse(success=True, data=profile.to_dict())


@router.get("/services", response_model=ApiResponse)
async def get_services(db: AsyncSession = Depends(get_db)):
    """Retrieve all available legal services."""
    services = await content_repo.get_all_services(db)
    return ApiResponse(success=True, data=[s.to_dict() for s in services])


@router.get("/testimonials", response_model=ApiResponse)
async def get_testimonials(db: AsyncSession = Depends(get_db)):
    """Retrieve client testimonials."""
    testimonials = await content_repo.get_all_testimonials(db)
    return ApiResponse(success=True, data=[t.to_dict() for t in testimonials])


@router.get("/faqs", response_model=ApiResponse)
async def get_faqs(db: AsyncSession = Depends(get_db)):
    """Retrieve frequently asked questions."""
    faqs = await content_repo.get_all_faqs(db)
    return ApiResponse(success=True, data=[f.to_dict() for f in faqs])


@router.post("/contact", response_model=ApiResponse)
async def submit_contact_form(data: ContactFormData):
    """Submit a contact inquiry."""
    # In a real implementation, you would save the contact and send notifications
    return ApiResponse(
        success=True,
        message="Thank you for your message. We will get back to you soon.",
    )
