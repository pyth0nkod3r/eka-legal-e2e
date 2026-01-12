"""Clients router - Admin operations for client management."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.schemas import (
    ApiResponse,
    CreateClientRequest,
    UpdateClientStatusRequest,
    UserRole,
    ClientStatus,
)
from app.models.user import User
from app.repositories import user as user_repo

router = APIRouter(prefix="/clients", tags=["Clients"])


async def require_admin_or_lawyer(db: AsyncSession, current_user: dict):
    """Check if user is admin or lawyer."""
    user = await user_repo.get_user_by_id(db, current_user["sub"])
    if not user or user.role not in (UserRole.ADMIN, UserRole.LAWYER):
        raise HTTPException(status_code=403, detail="Not authorized")
    return user


@router.get("", response_model=ApiResponse)
async def get_all_clients(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all clients (admin/lawyer only)."""
    await require_admin_or_lawyer(db, current_user)

    clients = await user_repo.get_clients(db)
    return ApiResponse(success=True, data=[c.to_dict() for c in clients])


@router.get("/search", response_model=ApiResponse)
async def search_clients(
    q: str = "",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search clients by name or email (admin/lawyer only)."""
    await require_admin_or_lawyer(db, current_user)

    clients = await user_repo.get_clients(db)

    if q and len(q.strip()) >= 1:
        query = q.lower().strip()
        clients = [
            c
            for c in clients
            if c.name.lower().startswith(query) or c.email.lower().startswith(query)
        ]

    return ApiResponse(success=True, data=[c.to_dict() for c in clients])


@router.post("", response_model=ApiResponse, status_code=201)
async def create_client(
    data: CreateClientRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new client (admin/lawyer only)."""
    await require_admin_or_lawyer(db, current_user)

    # Check if email already exists
    existing_user = await user_repo.get_user_by_email(db, data.email)
    if existing_user:
        return ApiResponse(success=False, message="Email already registered")

    # Create new client with temporary password
    new_client = User(
        id=f"user-{datetime.now(timezone.utc).timestamp():.0f}",
        email=data.email,
        name=data.name,
        role=UserRole.CLIENT,
        phone=data.phone,
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.name.replace(' ', '')}",
        status=ClientStatus.ACTIVE,
        password_hash=get_password_hash("temppass123"),  # Temporary password
    )

    await user_repo.add_user(db, new_client)

    return ApiResponse(
        success=True, data=new_client.to_dict(), message="Client created successfully"
    )


@router.get("/{client_id}", response_model=ApiResponse)
async def get_client_by_id(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific client by ID (admin/lawyer only)."""
    await require_admin_or_lawyer(db, current_user)

    user = await user_repo.get_user_by_id(db, client_id)
    if not user or user.role != UserRole.CLIENT:
        raise HTTPException(status_code=404, detail="Client not found")

    return ApiResponse(success=True, data=user.to_dict())


@router.patch("/{client_id}", response_model=ApiResponse)
async def update_client_status_endpoint(
    client_id: str,
    data: UpdateClientStatusRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a client's status (admin/lawyer only)."""
    await require_admin_or_lawyer(db, current_user)

    user = await user_repo.get_user_by_id(db, client_id)
    if not user or user.role != UserRole.CLIENT:
        raise HTTPException(status_code=404, detail="Client not found")

    # Update status
    updated_user = await user_repo.update_user(db, client_id, status=data.status)

    return ApiResponse(
        success=True, data=updated_user.to_dict(), message="Client status updated"
    )
