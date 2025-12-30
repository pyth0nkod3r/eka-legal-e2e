"""Repository for Case database operations."""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case import Case, Document, TimelineEvent
from app.schemas import CaseStatus


async def get_cases_by_client(db: AsyncSession, client_id: str) -> List[Case]:
    """Get all cases for a client."""
    result = await db.execute(select(Case).where(Case.client_id == client_id))
    return list(result.scalars().all())


async def get_all_cases(db: AsyncSession) -> List[Case]:
    """Get all cases."""
    result = await db.execute(select(Case))
    return list(result.scalars().all())


async def get_case_by_id(db: AsyncSession, case_id: str) -> Optional[Case]:
    """Get case by ID."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    return result.scalar_one_or_none()


async def get_cases_by_status(db: AsyncSession, status: CaseStatus) -> List[Case]:
    """Get cases filtered by status."""
    result = await db.execute(select(Case).where(Case.status == status))
    return list(result.scalars().all())


async def add_case(db: AsyncSession, case: Case) -> Case:
    """Add a new case."""
    db.add(case)
    await db.flush()
    return case


async def add_document(db: AsyncSession, document: Document) -> Document:
    """Add a document to a case."""
    db.add(document)
    await db.flush()
    return document


async def add_timeline_event(db: AsyncSession, event: TimelineEvent) -> TimelineEvent:
    """Add a timeline event to a case."""
    db.add(event)
    await db.flush()
    return event


async def update_case(db: AsyncSession, case_id: str, **kwargs) -> Optional[Case]:
    """Update case fields."""
    case = await get_case_by_id(db, case_id)
    if case:
        for key, value in kwargs.items():
            if hasattr(case, key):
                setattr(case, key, value)
        await db.flush()
    return case
