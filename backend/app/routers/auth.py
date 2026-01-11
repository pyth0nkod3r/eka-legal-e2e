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
)
from app.models.user import User
from app.repositories import user as user_repo

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
