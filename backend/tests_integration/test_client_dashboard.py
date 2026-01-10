"""Integration tests for client dashboard functionality.

Tests for:
- Client getting their own cases
- Client getting their own bookings
- Client getting their own conversations
- Client getting unread message count
"""

import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestClientCases:
    """Test client's case retrieval."""

    async def test_client_gets_only_their_cases(self, async_client):
        """Test that a client only sees their own cases."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/cases", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # All cases should belong to user-1
        for case in data["data"]:
            assert case["clientId"] == "user-1"

    async def test_client_cases_include_required_fields(self, async_client):
        """Test that client cases include all required fields for dashboard."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/cases", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        for case in data["data"]:
            assert "id" in case
            assert "title" in case
            assert "status" in case
            assert "caseType" in case
            assert "documents" in case
            assert "updatedAt" in case


@pytest.mark.asyncio
class TestClientBookings:
    """Test client's booking retrieval."""

    async def test_client_gets_only_their_bookings(self, async_client):
        """Test that a client only sees their own bookings."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/booking/bookings", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # All bookings should belong to user-1
        for booking in data["data"]:
            assert booking["clientId"] == "user-1"

    async def test_client_bookings_include_required_fields(self, async_client):
        """Test that client bookings include all required fields for dashboard."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/booking/bookings", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        for booking in data["data"]:
            assert "id" in booking
            assert "date" in booking
            assert "time" in booking
            assert "status" in booking
            assert "consultationType" in booking


@pytest.mark.asyncio
class TestClientConversations:
    """Test client's conversation retrieval."""

    async def test_client_gets_their_conversations(self, async_client):
        """Test that a client gets conversations they're a participant in."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/messages/conversations", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # All conversations should have user-1 as a participant
        for conv in data["data"]:
            participant_ids = [p["id"] for p in conv["participants"]]
            assert "user-1" in participant_ids

    async def test_client_conversations_include_unread_count(self, async_client):
        """Test that client conversations include unread count."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/messages/conversations", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        for conv in data["data"]:
            assert "unreadCount" in conv
            assert isinstance(conv["unreadCount"], int)


@pytest.mark.asyncio
class TestClientUnreadMessages:
    """Test client's unread message count."""

    async def test_client_gets_unread_count(self, async_client):
        """Test that a client can get their total unread message count."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/messages/unread-count", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "unreadCount" in data["data"]
        assert isinstance(data["data"]["unreadCount"], int)


@pytest.mark.asyncio
class TestClientDashboardStatsComputation:
    """Test that enough data is available to compute client dashboard stats."""

    async def test_can_compute_active_cases_count(self, async_client):
        """Test that we can compute active cases from the cases endpoint."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/cases", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        # Count active and pending cases
        active_cases = [c for c in data["data"] if c["status"] in ["active", "pending"]]
        assert isinstance(len(active_cases), int)

    async def test_can_compute_upcoming_appointments_count(self, async_client):
        """Test that we can compute upcoming appointments from bookings endpoint."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/booking/bookings", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        # Count confirmed bookings
        confirmed_bookings = [b for b in data["data"] if b["status"] == "confirmed"]
        assert isinstance(len(confirmed_bookings), int)

    async def test_can_compute_documents_count(self, async_client):
        """Test that we can compute total documents from cases endpoint."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/cases", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        # Sum up documents across all cases
        total_docs = sum(len(c["documents"]) for c in data["data"])
        assert isinstance(total_docs, int)
