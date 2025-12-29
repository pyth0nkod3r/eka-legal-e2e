"""Authentication router."""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends

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
)
from app.models import get_user_by_email, add_user, USERS

router = APIRouter(prefix="/auth", tags=["Authentication"])


def user_to_response(user: dict) -> dict:
    """Convert user dict to response (exclude password_hash)."""
    return {k: v for k, v in user.items() if k != "password_hash"}


@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginCredentials):
    """Authenticate user with email and password."""
    user = get_user_by_email(credentials.email)
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        return AuthResponse(
            success=False,
            message="Invalid email or password",
        )
    
    token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    
    return AuthResponse(
        success=True,
        data={
            "user": user_to_response(user),
            "token": token,
        },
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterData):
    """Register a new client account."""
    existing_user = get_user_by_email(data.email)
    if existing_user:
        return AuthResponse(
            success=False,
            message="Email already registered",
        )
    
    new_user = {
        "id": f"user-{datetime.now(timezone.utc).timestamp():.0f}",
        "email": data.email,
        "name": data.name,
        "role": "client",
        "phone": data.phone,
        "avatarUrl": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "password_hash": get_password_hash(data.password),
    }
    
    add_user(new_user)
    token = create_access_token(data={"sub": new_user["id"], "email": new_user["email"]})
    
    return AuthResponse(
        success=True,
        data={
            "user": user_to_response(new_user),
            "token": token,
        },
    )


@router.post("/logout", response_model=ApiResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """Invalidate user session."""
    # In a real implementation, you would invalidate the token
    return ApiResponse(success=True, message="Logged out successfully")


@router.get("/me", response_model=ApiResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    user = USERS.get(current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return ApiResponse(success=True, data=user_to_response(user))


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
