"""Public content router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import (
    ApiResponse,
    ContactFormData,
    UpdateLawyerProfileRequest,
    UserRole,
)
from app.repositories import content as content_repo
from app.models.content import LawyerProfile
from app.repositories import user as user_repo
from app.core.security import get_current_user
from fastapi import HTTPException, status

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/lawyer-profile", response_model=ApiResponse)
async def get_lawyer_profile(db: AsyncSession = Depends(get_db)):
    """Retrieve the lawyer's public profile information."""
    profile = await content_repo.get_lawyer_profile(db)
    if not profile:
        # Create default profile if none exists
        profile = LawyerProfile(
            id="lawyer-1",
            name="Eka Utibe, Esq.",
            title="Principal Attorney & Founder",
            bio="Default bio",
            photo_url="/lawyer-profile.jpg",
            credentials=[],
            practice_areas=[],
            years_experience=15,
            email="uti@eka-legal.com",
            phone="+1 (403) 560-9464",
            address="555 4 Ave SW, Calgary, AB T2P 3E7, Canada",
            firm_name="Eka Legal Consultancy",
        )
        await content_repo.add_lawyer_profile(db, profile)

    return ApiResponse(success=True, data=profile.to_dict())


@router.put("/lawyer-profile", response_model=ApiResponse)
async def update_lawyer_profile(
    data: UpdateLawyerProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update lawyer profile information. Admin only."""
    # Check if admin
    user = await user_repo.get_user_by_id(db, current_user["sub"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )

    profile = await content_repo.get_lawyer_profile(db)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    updated_profile = await content_repo.update_lawyer_profile(
        db, profile, **data.model_dump(exclude_unset=True)
    )

    return ApiResponse(success=True, data=updated_profile.to_dict())


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
