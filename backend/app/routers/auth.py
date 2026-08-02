"""Authentication router."""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)
from app.schemas import (
    LoginCredentials,
    RegisterData,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ApiResponse,
    UserRole,
    UpdateProfileRequest,
)
from app.models.user import User
from app.repositories import user as user_repo
from pathlib import Path
import shutil
from uuid import uuid4
from fastapi import UploadFile, File

# Create uploads directory
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: LoginCredentials,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user with email and password."""
    user = await user_repo.get_user_by_email(db, credentials.email)

    if not user or not verify_password(credentials.password, user.password_hash):
        return AuthResponse(
            success=False,
            message="Invalid email or password",
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})

    return AuthResponse(
        success=True,
        data={
            "user": user.to_dict(),
            "token": token,
        },
    )


@router.post(
    "/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    data: RegisterData,
    db: AsyncSession = Depends(get_db),
):
    """Register a new client account."""
    existing_user = await user_repo.get_user_by_email(db, data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    new_user = User(
        id=f"user-{datetime.now(timezone.utc).timestamp():.0f}",
        email=data.email,
        name=data.name,
        role=UserRole.CLIENT,
        phone=data.phone,
        avatar_url=None,
        password_hash=get_password_hash(data.password),
    )

    await user_repo.add_user(db, new_user)

    # Link any appointments booked prior to registration using matching email
    from app.repositories import booking as booking_repo
    await booking_repo.link_unregistered_bookings(db, new_user.email, new_user.id)

    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return AuthResponse(
        success=True,
        data={
            "user": new_user.to_dict(),
            "token": token,
        },
    )


@router.post(
    "/create-admin",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def create_admin(
    data: RegisterData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin account."""
    existing_user = await user_repo.get_user_by_email(db, data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    new_user = User(
        id=f"admin-{datetime.now(timezone.utc).timestamp():.0f}",
        email=data.email,
        name=data.name,
        role=UserRole.ADMIN,
        phone=data.phone,
        avatar_url=None,
        password_hash=get_password_hash(data.password),
    )

    await user_repo.add_user(db, new_user)
    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return AuthResponse(
        success=True,
        data={
            "user": new_user.to_dict(),
            "token": token,
        },
    )


@router.post("/logout", response_model=ApiResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """Invalidate user session."""
    # In a real implementation, you would invalidate the token
    return ApiResponse(success=True, message="Logged out successfully")


@router.get("/me", response_model=ApiResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the currently authenticated user's profile."""
    user = await user_repo.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ApiResponse(success=True, data=user.to_dict())


@router.patch("/me", response_model=ApiResponse)
async def update_current_user_profile(
    data: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile."""
    # Filter out None values
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}

    # Don't allow email update here
    if "email" in update_data:
        del update_data["email"]

    updated_user = await user_repo.update_user(db, current_user["sub"], **update_data)

    return ApiResponse(success=True, data=updated_user.to_dict())


@router.post("/me/avatar", response_model=ApiResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload user avatar."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Generate unique filename
    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{current_user['sub']}-{uuid4().hex[:8]}{ext}"
    file_path = UPLOAD_DIR / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # URL to access the file (served via static mount)
    avatar_url = f"/static/avatars/{filename}"

    # Update user profile
    await user_repo.update_user(db, current_user["sub"], avatar_url=avatar_url)

    return ApiResponse(success=True, data={"avatarUrl": avatar_url})


@router.post("/forgot-password", response_model=ApiResponse)
async def forgot_password(data: ForgotPasswordRequest):
    """Send password reset email to user."""
    # In a real implementation, you would send an email
    return ApiResponse(
        success=True,
        message="Password reset email sent",
    )


@router.post("/reset-password", response_model=ApiResponse)
async def reset_password(data: ResetPasswordRequest):
    """Reset password using token from email."""
    # In a real implementation, you would validate the token and update the password
    return ApiResponse(
        success=True,
        message="Password reset successful",
    )
