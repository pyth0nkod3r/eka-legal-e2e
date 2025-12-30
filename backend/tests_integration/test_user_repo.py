"""Integration tests for User repository operations."""

import pytest
import pytest_asyncio
from datetime import datetime, timezone

from app.models.user import User
from app.schemas import UserRole
from app.core.security import get_password_hash, verify_password
from app.repositories import user as user_repo


@pytest.mark.asyncio
class TestUserRepository:
    """Test user repository with real database."""
    
    async def test_add_user(self, db_session):
        """Test adding a new user to the database."""
        user = User(
            id="new-user-1",
            email="newuser@test.com",
            name="New User",
            role=UserRole.CLIENT,
            phone="+1234567890",
            password_hash=get_password_hash("password123"),
        )
        
        result = await user_repo.add_user(db_session, user)
        
        assert result.id == "new-user-1"
        assert result.email == "newuser@test.com"
        assert result.name == "New User"
        assert result.role == UserRole.CLIENT
    
    async def test_get_user_by_email(self, seeded_db):
        """Test finding user by email."""
        user = await user_repo.get_user_by_email(seeded_db, "testuser@test.com")
        
        assert user is not None
        assert user.id == "test-user-1"
        assert user.name == "Test User"
    
    async def test_get_user_by_email_not_found(self, seeded_db):
        """Test finding non-existent user."""
        user = await user_repo.get_user_by_email(seeded_db, "nonexistent@test.com")
        
        assert user is None
    
    async def test_get_user_by_id(self, seeded_db):
        """Test finding user by ID."""
        user = await user_repo.get_user_by_id(seeded_db, "test-user-1")
        
        assert user is not None
        assert user.email == "testuser@test.com"
    
    async def test_get_all_users(self, seeded_db):
        """Test getting all users."""
        users = await user_repo.get_all_users(seeded_db)
        
        assert len(users) == 3  # user, lawyer, admin
    
    async def test_get_clients(self, seeded_db):
        """Test getting only client users."""
        clients = await user_repo.get_clients(seeded_db)
        
        assert len(clients) == 1
        assert clients[0].role == UserRole.CLIENT
    
    async def test_update_user(self, seeded_db):
        """Test updating user fields."""
        updated = await user_repo.update_user(
            seeded_db,
            "test-user-1",
            name="Updated Name",
            phone="+9999999999"
        )
        
        assert updated is not None
        assert updated.name == "Updated Name"
        assert updated.phone == "+9999999999"
    
    async def test_password_verification(self, seeded_db):
        """Test password hash and verification."""
        user = await user_repo.get_user_by_email(seeded_db, "testuser@test.com")
        
        assert user is not None
        assert verify_password("testpassword123", user.password_hash)
        assert not verify_password("wrongpassword", user.password_hash)
    
    async def test_user_to_dict(self, seeded_db):
        """Test user serialization to dictionary."""
        user = await user_repo.get_user_by_id(seeded_db, "test-user-1")
        
        user_dict = user.to_dict()
        
        assert "id" in user_dict
        assert "email" in user_dict
        assert "password_hash" not in user_dict  # Should not expose password
        assert user_dict["role"] == "client"
