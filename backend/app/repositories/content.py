"""Repository for public content database operations."""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import LawyerProfile, Service, Testimonial, FAQ


async def get_lawyer_profile(db: AsyncSession) -> Optional[LawyerProfile]:
    """Get the main lawyer profile."""
    result = await db.execute(select(LawyerProfile))
    return result.scalar_one_or_none()


async def update_lawyer_profile(
    db: AsyncSession, profile: LawyerProfile, **kwargs
) -> LawyerProfile:
    """Update lawyer profile."""
    for key, value in kwargs.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)

    await db.flush()
    await db.refresh(profile)
    return profile


async def get_all_services(db: AsyncSession) -> List[Service]:
    """Get all services."""
    result = await db.execute(select(Service))
    return list(result.scalars().all())


async def get_service_by_id(db: AsyncSession, service_id: str) -> Optional[Service]:
    """Get service by ID."""
    result = await db.execute(select(Service).where(Service.id == service_id))
    return result.scalar_one_or_none()


async def get_all_testimonials(db: AsyncSession) -> List[Testimonial]:
    """Get all testimonials."""
    result = await db.execute(select(Testimonial))
    return list(result.scalars().all())


async def get_all_faqs(db: AsyncSession, category: Optional[str] = None) -> List[FAQ]:
    """Get all FAQs, optionally filtered by category."""
    query = select(FAQ)
    if category:
        query = query.where(FAQ.category == category)
    result = await db.execute(query)
    return list(result.scalars().all())


async def add_lawyer_profile(db: AsyncSession, profile: LawyerProfile) -> LawyerProfile:
    """Add a lawyer profile."""
    db.add(profile)
    await db.flush()
    return profile


async def add_service(db: AsyncSession, service: Service) -> Service:
    """Add a service."""
    db.add(service)
    await db.flush()
    return service


async def add_testimonial(db: AsyncSession, testimonial: Testimonial) -> Testimonial:
    """Add a testimonial."""
    db.add(testimonial)
    await db.flush()
    return testimonial


async def add_faq(db: AsyncSession, faq: FAQ) -> FAQ:
    """Add an FAQ."""
    db.add(faq)
    await db.flush()
    return faq
