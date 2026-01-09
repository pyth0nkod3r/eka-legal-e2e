"""Clients router - Admin operations for client management."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user, get_password_hash
from app.schemas import ApiResponse, CreateClientRequest, UpdateClientStatusRequest
from app.models import get_clients, add_user, get_user_by_email, get_user_by_id, update_user_status

router = APIRouter(prefix="/clients", tags=["Clients"])


def require_admin_or_lawyer(current_user: dict):
    """Check if user is admin or lawyer."""
    user = get_user_by_id(current_user["sub"])
    if not user or user["role"] not in ("admin", "lawyer"):
        raise HTTPException(status_code=403, detail="Not authorized")
    return user


@router.get("", response_model=ApiResponse)
async def get_all_clients(current_user: dict = Depends(get_current_user)):
    """Get all clients (admin/lawyer only)."""
    require_admin_or_lawyer(current_user)
    
    clients = get_clients()
    # Remove password_hash from response
    safe_clients = [{k: v for k, v in c.items() if k != "password_hash"} for c in clients]
    
    return ApiResponse(success=True, data=safe_clients)


@router.get("/search", response_model=ApiResponse)
async def search_clients(
    q: str = "",
    current_user: dict = Depends(get_current_user),
):
    """Search clients by name or email (admin/lawyer only)."""
    require_admin_or_lawyer(current_user)
    
    if not q or len(q.strip()) < 1:
        # Return all clients if no search query
        clients = get_clients()
    else:
        query = q.lower().strip()
        clients = [
            c for c in get_clients()
            if query in c.get("name", "").lower() or query in c.get("email", "").lower()
        ]
    
    # Remove password_hash from response
    safe_clients = [{k: v for k, v in c.items() if k != "password_hash"} for c in clients]
    
    return ApiResponse(success=True, data=safe_clients)


@router.post("", response_model=ApiResponse, status_code=201)
async def create_client(
    data: CreateClientRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new client (admin/lawyer only)."""
    require_admin_or_lawyer(current_user)
    
    # Check if email already exists
    existing_user = get_user_by_email(data.email)
    if existing_user:
        return ApiResponse(success=False, message="Email already registered")
    
    # Create new client with temporary password
    new_client = {
        "id": f"user-{datetime.now(timezone.utc).timestamp():.0f}",
        "email": data.email,
        "name": data.name,
        "role": "client",
        "phone": data.phone,
        "avatarUrl": f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.name.replace(' ', '')}",
        "status": "active",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "password_hash": get_password_hash("temppass123"),  # Temporary password
    }
    
    add_user(new_client)
    
    # Return without password_hash
    safe_client = {k: v for k, v in new_client.items() if k != "password_hash"}
    
    return ApiResponse(success=True, data=safe_client, message="Client created successfully")


@router.get("/{client_id}", response_model=ApiResponse)
async def get_client_by_id(
    client_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific client by ID (admin/lawyer only)."""
    require_admin_or_lawyer(current_user)
    
    user = get_user_by_id(client_id)
    if not user or user["role"] != "client":
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Remove password_hash from response
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    
    return ApiResponse(success=True, data=safe_user)


@router.patch("/{client_id}", response_model=ApiResponse)
async def update_client_status_endpoint(
    client_id: str,
    data: UpdateClientStatusRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a client's status (admin/lawyer only)."""
    require_admin_or_lawyer(current_user)
    
    user = get_user_by_id(client_id)
    if not user or user["role"] != "client":
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Update status
    updated_user = update_user_status(client_id, data.status.value)
    
    # Remove password_hash from response
    safe_user = {k: v for k, v in updated_user.items() if k != "password_hash"}
    
    return ApiResponse(success=True, data=safe_user, message="Client status updated")

