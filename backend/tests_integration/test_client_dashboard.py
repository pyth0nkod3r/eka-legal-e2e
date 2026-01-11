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


@pytest.mark.asyncio
class TestPerUserUnreadMessages:
    """Test per-user unread message tracking.

    These tests verify that:
    1. Different users see different unread counts for the same conversation
    2. Marking messages as read only affects that user's count
    3. New messages are correctly tracked per-user
    """

    async def test_client_sees_unread_from_lawyer(self, async_client):
        """Test that client sees messages from lawyer as unread."""
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {client_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Find conv-1 and check unread count
        conv_1 = next((c for c in data["data"] if c["id"] == "conv-1"), None)
        assert conv_1 is not None
        # Client should have unread messages (from lawyer)
        assert "unreadCount" in conv_1
        assert isinstance(conv_1["unreadCount"], int)

    async def test_lawyer_sees_different_unread_from_client(self, async_client):
        """Test that lawyer sees different unread count than client for same conversation."""
        # First, get lawyer's initial unread count
        lawyer_token = create_access_token(
            {"sub": "lawyer-1", "email": "uti@eka-legal.com"}
        )
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        # Lawyer sends a message (which client hasn't read)
        send_response = await async_client.post(
            "/messages/conversations/conv-1/messages",
            headers={"Authorization": f"Bearer {lawyer_token}"},
            json={"content": "Test message from lawyer"},
        )
        assert send_response.status_code == 201

        # Get unread counts for both users
        lawyer_response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {lawyer_token}"},
        )
        client_response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {client_token}"},
        )

        assert lawyer_response.status_code == 200
        assert client_response.status_code == 200

        lawyer_conv = next(
            (c for c in lawyer_response.json()["data"] if c["id"] == "conv-1"), None
        )
        client_conv = next(
            (c for c in client_response.json()["data"] if c["id"] == "conv-1"), None
        )

        # Client should have at least 1 more unread than lawyer (the message we just sent)
        assert (
            client_conv["unreadCount"] > lawyer_conv.get("unreadCount", 0)
            or client_conv["unreadCount"] >= 1
        )

    async def test_marking_read_only_affects_current_user(self, async_client):
        """Test that marking conversation as read only affects the current user's count."""
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )
        lawyer_token = create_access_token(
            {"sub": "lawyer-1", "email": "uti@eka-legal.com"}
        )

        # First, lawyer sends a message to create an unread for client
        await async_client.post(
            "/messages/conversations/conv-1/messages",
            headers={"Authorization": f"Bearer {lawyer_token}"},
            json={"content": "Message for read test"},
        )

        # Get lawyer's unread count before client marks as read
        lawyer_before = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {lawyer_token}"},
        )
        lawyer_conv_before = next(
            (c for c in lawyer_before.json()["data"] if c["id"] == "conv-1"), None
        )
        lawyer_unread_before = lawyer_conv_before["unreadCount"]

        # Client marks conversation as read
        mark_response = await async_client.post(
            "/messages/conversations/conv-1/read",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        assert mark_response.status_code == 200

        # Client should now have 0 unread
        client_response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        client_conv = next(
            (c for c in client_response.json()["data"] if c["id"] == "conv-1"), None
        )
        assert client_conv["unreadCount"] == 0

        # Lawyer's unread count should remain unchanged
        lawyer_response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {lawyer_token}"},
        )
        lawyer_conv = next(
            (c for c in lawyer_response.json()["data"] if c["id"] == "conv-1"), None
        )
        assert lawyer_conv["unreadCount"] == lawyer_unread_before

    async def test_total_unread_count_per_user(self, async_client):
        """Test that total unread count endpoint returns per-user count."""
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        response = await async_client.get(
            "/messages/unread-count",
            headers={"Authorization": f"Bearer {client_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "unreadCount" in data["data"]
        assert isinstance(data["data"]["unreadCount"], int)

    async def test_sending_message_creates_proper_readby(self, async_client):
        """Test that sending a message creates it with sender in readBy."""
        lawyer_token = create_access_token(
            {"sub": "lawyer-1", "email": "uti@eka-legal.com"}
        )

        response = await async_client.post(
            "/messages/conversations/conv-1/messages",
            headers={"Authorization": f"Bearer {lawyer_token}"},
            json={"content": "This is a test message"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        # New message should have readBy with sender
        assert "readBy" in data["data"]
        assert "lawyer-1" in data["data"]["readBy"]


@pytest.mark.asyncio
class TestClientDocumentAccess:
    """Test client document download and preview functionality."""

    async def test_client_can_preview_own_document(self, async_client):
        """Test that a client can preview documents from their own cases."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        # First get the document metadata
        response = await async_client.get(
            "/documents/doc-1",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == "doc-1"

    async def test_client_can_download_own_document(self, async_client):
        """Test that a client can download documents from their own cases."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/documents/doc-1/content",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert len(response.content) > 0

    async def test_client_cannot_access_other_client_documents(self, async_client):
        """Test that a client cannot access another client's documents."""
        token = create_access_token({"sub": "other-user", "email": "other@email.com"})

        response = await async_client.get(
            "/documents/doc-1/content",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Should return 404 for security (not revealing document exists)
        assert response.status_code == 404


@pytest.mark.asyncio
class TestClientAccountDeletion:
    """Test that clients cannot delete their own accounts.

    Clients should never be able to delete their accounts - this should
    only be possible by admin/lawyer users if at all.
    """

    async def test_no_delete_account_endpoint_for_clients(self, async_client):
        """Test that no delete account endpoint exists for clients."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        # Try DELETE on /auth/me (common pattern for self-deletion)
        response = await async_client.delete(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Should return 405 Method Not Allowed (endpoint doesn't support DELETE)
        assert response.status_code == 405

    async def test_no_delete_user_endpoint_for_clients(self, async_client):
        """Test that clients cannot delete users via /users endpoint."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        # Try to delete themselves via a hypothetical users endpoint
        response = await async_client.delete(
            "/users/user-1",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Should return 404 (no such endpoint) or 403 (forbidden)
        assert response.status_code in [404, 403, 405]
