"""Integration tests for message search and auto-select features.

Tests for:
1. Client search with 3-character threshold
2. Client auto-selecting admin conversation
"""

import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestClientSearch:
    """Test client search functionality for admin dashboard."""

    async def test_search_clients_requires_auth(self, async_client):
        """Test that search endpoint requires authentication."""
        response = await async_client.get("/clients/search?q=Test")
        assert response.status_code == 401

    async def test_search_clients_with_3_chars(self, async_client, admin_token):
        """Test that search works with 3 character query."""
        response = await async_client.get(
            "/clients/search?q=Tes",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # Should return clients whose name contains "Tes"
        for client in data["data"]:
            assert "tes" in client["name"].lower() or "tes" in client["email"].lower()

    async def test_search_filters_progressively(self, async_client, admin_token):
        """Test that adding more letters narrows results."""
        # Search with 'Tes'
        response1 = await async_client.get(
            "/clients/search?q=Tes",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        # Search with 'Test'
        response2 = await async_client.get(
            "/clients/search?q=Test",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200

        results1 = response1.json()["data"]
        results2 = response2.json()["data"]

        # More specific query should have same or fewer results
        assert len(results2) <= len(results1)

    async def test_search_returns_client_details(self, async_client, admin_token):
        """Test that search returns required client fields for display."""
        response = await async_client.get(
            "/clients/search?q=Test",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for client in data["data"]:
            # Required fields for frontend display
            assert "id" in client
            assert "name" in client
            assert "email" in client


@pytest.mark.asyncio
class TestClientAutoSelectConversation:
    """Test client auto-selecting admin conversation on messages page."""

    async def test_client_conversations_returns_list(self, async_client, user_token):
        """Test that client gets a list of conversations."""
        response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    async def test_client_conversation_has_admin_participant(
        self, async_client, user_token
    ):
        """Test that client conversations include admin/lawyer participant."""
        response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        if len(data["data"]) > 0:
            first_conv = data["data"][0]
            assert "participants" in first_conv
            # At least one participant should be lawyer or admin
            roles = [p.get("role", "") for p in first_conv["participants"]]
            assert any(r in ["lawyer", "admin"] for r in roles)

    async def test_conversation_has_id_for_auto_redirect(
        self, async_client, user_token
    ):
        """Test that conversations have IDs for frontend auto-redirect."""
        response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        for conv in data["data"]:
            assert "id" in conv
            assert conv["id"]  # ID should not be empty
