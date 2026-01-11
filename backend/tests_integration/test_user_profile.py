import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestUserProfile:
    """Test user profile functionality."""

    async def test_client_can_update_profile(self, async_client):
        """Test that a client can update their profile (name, phone, avatar)."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        update_data = {
            "name": "Updated Name",
            "phone": "+9876543210",
            "avatarUrl": "https://example.com/new-avatar.jpg",
        }

        response = await async_client.patch(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            json=update_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "Updated Name"
        assert data["data"]["phone"] == "+9876543210"
        assert data["data"]["avatarUrl"] == "https://example.com/new-avatar.jpg"

        # Verify persistence
        response_get = await async_client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response_get.status_code == 200
        data_get = response_get.json()
        assert data_get["data"]["name"] == "Updated Name"

    async def test_client_cannot_update_email(self, async_client):
        """Test that a client cannot update their email via profile update."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        update_data = {"email": "new.email@example.com", "name": "Another Name"}

        response = await async_client.patch(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            json=update_data,
        )

        # Should succeed but email should NOT change
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["email"] == "john.doe@email.com"
        assert data["data"]["name"] == "Another Name"
