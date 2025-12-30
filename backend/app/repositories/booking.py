"""Repository for Booking database operations."""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, ConsultationType


async def get_consultation_types(db: AsyncSession) -> List[ConsultationType]:
    """Get all consultation types."""
    result = await db.execute(select(ConsultationType))
    return list(result.scalars().all())


async def get_consultation_type_by_id(db: AsyncSession, type_id: str) -> Optional[ConsultationType]:
    """Get consultation type by ID."""
    result = await db.execute(select(ConsultationType).where(ConsultationType.id == type_id))
    return result.scalar_one_or_none()


async def get_bookings_by_client(db: AsyncSession, client_id: str) -> List[Booking]:
    """Get all bookings for a client."""
    result = await db.execute(select(Booking).where(Booking.client_id == client_id))
    return list(result.scalars().all())


async def get_all_bookings(db: AsyncSession) -> List[Booking]:
    """Get all bookings."""
    result = await db.execute(select(Booking))
    return list(result.scalars().all())


async def get_booking_by_id(db: AsyncSession, booking_id: str) -> Optional[Booking]:
    """Get booking by ID."""
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    return result.scalar_one_or_none()


async def add_booking(db: AsyncSession, booking: Booking) -> Booking:
    """Add a new booking."""
    db.add(booking)
    await db.flush()
    return booking


async def add_consultation_type(db: AsyncSession, consultation_type: ConsultationType) -> ConsultationType:
    """Add a new consultation type."""
    db.add(consultation_type)
    await db.flush()
    return consultation_type


async def update_booking(db: AsyncSession, booking_id: str, **kwargs) -> Optional[Booking]:
    """Update booking fields."""
    booking = await get_booking_by_id(db, booking_id)
    if booking:
        for key, value in kwargs.items():
            if hasattr(booking, key):
                setattr(booking, key, value)
        await db.flush()
    return booking
