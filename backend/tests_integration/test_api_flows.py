"""Integration tests for complete API flows using real database.

Note: These tests use the MOCK database since routers haven't been migrated yet.
They test the API endpoints work correctly with the current implementation.
"""

import pytest
import pytest_asyncio
from datetime import datetime, timezone

from app.models.user import User
from app.models.case import Case
from app.models.booking import ConsultationType, Booking
from app.schemas import UserRole, CaseStatus, BookingStatus
from app.core.security import get_password_hash, create_access_token


@pytest.mark.asyncio
class TestAuthFlow:
    """Test authentication flow with API."""
    
    async def test_register_and_login_flow(self, async_client):
        """Test complete registration and login flow."""
        # Register a new user
        register_response = await async_client.post(
            "/auth/register",
            json={
                "name": "Flow Test User",
                "email": "flowtest@test.com",
                "password": "flowpassword123",
            }
        )
        
        assert register_response.status_code == 201
        data = register_response.json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert data["data"]["user"]["email"] == "flowtest@test.com"
        
        # Login with the new user
        login_response = await async_client.post(
            "/auth/login",
            json={
                "email": "flowtest@test.com",
                "password": "flowpassword123",
            }
        )
        
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert login_data["success"] is True
        assert "token" in login_data["data"]
    
    async def test_login_with_wrong_password(self, async_client):
        """Test login failure with wrong password."""
        # First register
        await async_client.post(
            "/auth/register",
            json={
                "name": "Wrong Pass User",
                "email": "wrongpass@test.com",
                "password": "correctpassword",
            }
        )
        
        # Try login with wrong password
        response = await async_client.post(
            "/auth/login",
            json={
                "email": "wrongpass@test.com",
                "password": "incorrectpassword",
            }
        )
        
        data = response.json()
        assert data["success"] is False
        assert "Invalid" in data["message"]
    
    async def test_get_current_user(self, async_client):
        """Test getting current user profile."""
        # Register user
        reg_response = await async_client.post(
            "/auth/register",
            json={
                "name": "Current User",
                "email": "currentuser@test.com",
                "password": "password123",
            }
        )
        token = reg_response.json()["data"]["token"]
        
        # Get current user
        response = await async_client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "currentuser@test.com"


@pytest.mark.asyncio
class TestPublicEndpoints:
    """Test public API endpoints."""
    
    async def test_get_consultation_types(self, async_client):
        """Test getting consultation types from mock."""
        response = await async_client.get("/booking/consultation-types")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Mock has 3 consultation types
        assert len(data["data"]) == 3
    
    async def test_get_available_slots(self, async_client):
        """Test getting available time slots."""
        response = await async_client.get("/booking/available-slots?date=2025-02-01")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) > 0
    
    async def test_get_services(self, async_client):
        """Test getting services."""
        response = await async_client.get("/public/services")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) > 0
    
    async def test_get_lawyer_profile(self, async_client):
        """Test getting lawyer profile."""
        response = await async_client.get("/public/lawyer-profile")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "name" in data["data"]


@pytest.mark.asyncio
class TestBookingFlow:
    """Test booking flow with mock database."""
    
    async def test_create_booking_with_valid_type(self, async_client):
        """Test booking creation with valid consultation type from mock."""
        response = await async_client.post(
            "/booking/bookings",
            json={
                "consultationTypeId": "consult-1",  # Valid mock ID
                "date": "2025-02-01",
                "time": "10:00",
                "name": "Booking Guest",
                "email": "guest@test.com",
                "reason": "Need legal advice",
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["clientEmail"] == "guest@test.com"
        assert data["data"]["status"] == "pending"
    
    async def test_create_booking_with_invalid_type(self, async_client):
        """Test booking creation fails with invalid type."""
        response = await async_client.post(
            "/booking/bookings",
            json={
                "consultationTypeId": "invalid-consult-type",
                "date": "2025-02-01",
                "time": "10:00",
                "name": "Booking Guest",
                "email": "guest@test.com",
                "reason": "Need legal advice",
            }
        )
        
        data = response.json()
        assert data["success"] is False


@pytest.mark.asyncio  
class TestCaseFlow:
    """Test case management with mock database."""
    
    async def test_unauthorized_access_to_cases(self, async_client):
        """Test that unauthenticated users can't access cases."""
        response = await async_client.get("/cases")
        
        assert response.status_code == 401
    
    async def test_authenticated_user_can_access_cases(self, async_client):
        """Test that authenticated mock user can access their cases."""
        # Use mock user who has cases
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.get(
            "/cases",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Mock user has 2 cases
        assert len(data["data"]) == 2
    
    async def test_get_case_by_id_from_mock(self, async_client):
        """Test getting a specific case from mock."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.get(
            "/cases/case-1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "Business Contract Review"


@pytest.mark.asyncio
class TestNotifications:
    """Test notification endpoints."""
    
    async def test_get_notifications_for_user(self, async_client):
        """Test getting notifications for authenticated user."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
