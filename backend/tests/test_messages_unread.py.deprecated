"""Tests for messages unread count behavior."""

import pytest
from app.models import CONVERSATIONS, MESSAGES


@pytest.fixture(autouse=True)
def reset_messages():
    """Reset messages to known state before each test."""
    # Store original state
    original_convs = {k: v.copy() for k, v in CONVERSATIONS.items()}
    original_msgs = {k: [m.copy() for m in v] for k, v in MESSAGES.items()}

    # Reset to known state
    CONVERSATIONS["conv-1"] = {
        "id": "conv-1",
        "caseId": "case-1",
        "caseTitle": "Business Contract Review",
        "participants": [
            {"id": "user-1", "name": "John Doe", "role": "client"},
            {"id": "lawyer-1", "name": "Eka Utibe", "role": "lawyer"},
        ],
        "lastMessage": "I've reviewed the amendments.",
        "lastMessageAt": "2024-01-01T14:00:00Z",
        "unreadCount": 2,
    }

    CONVERSATIONS["conv-2"] = {
        "id": "conv-2",
        "caseId": "case-2",
        "caseTitle": "Estate Planning",
        "participants": [
            {"id": "user-1", "name": "John Doe", "role": "client"},
            {"id": "lawyer-1", "name": "Eka Utibe", "role": "lawyer"},
        ],
        "lastMessage": "Documents are ready.",
        "lastMessageAt": "2024-01-02T10:00:00Z",
        "unreadCount": 3,
    }

    MESSAGES["conv-1"] = [
        {"id": "msg-1", "senderId": "lawyer-1", "content": "Hello", "read": False},
        {"id": "msg-2", "senderId": "lawyer-1", "content": "Update", "read": False},
    ]

    MESSAGES["conv-2"] = [
        {"id": "msg-3", "senderId": "lawyer-1", "content": "Ready", "read": False},
        {"id": "msg-4", "senderId": "lawyer-1", "content": "Check", "read": False},
        {"id": "msg-5", "senderId": "lawyer-1", "content": "Done", "read": False},
    ]

    yield

    # Restore original state
    CONVERSATIONS.clear()
    CONVERSATIONS.update(original_convs)
    MESSAGES.clear()
    MESSAGES.update(original_msgs)


class TestGetTotalUnreadCount:
    """Tests for GET /messages/unread-count endpoint."""

    def test_get_total_unread_count(self, client, auth_headers):
        """Test getting total unread message count."""
        response = client.get("/messages/unread-count", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["unreadCount"] == 5  # 2 from conv-1 + 3 from conv-2

    def test_unread_count_unauthorized(self, client):
        """Test getting unread count without auth."""
        response = client.get("/messages/unread-count")
        assert response.status_code == 401


class TestMarkConversationRead:
    """Tests for marking a conversation as read."""

    def test_mark_conversation_read(self, client, auth_headers):
        """Test marking all messages in a conversation as read."""
        response = client.post(
            "/messages/conversations/conv-1/read", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "unreadCount" in data["data"]

    def test_mark_conversation_read_decreases_total(self, client, auth_headers):
        """Test that marking conversation as read decreases total unread count."""
        # Get initial count
        initial_response = client.get("/messages/unread-count", headers=auth_headers)
        initial_count = initial_response.json()["data"]["unreadCount"]
        assert initial_count == 5

        # Mark conv-1 as read (has 2 unread)
        client.post("/messages/conversations/conv-1/read", headers=auth_headers)

        # Check total decreased
        after_response = client.get("/messages/unread-count", headers=auth_headers)
        after_count = after_response.json()["data"]["unreadCount"]
        assert after_count == 3  # 5 - 2 = 3

    def test_mark_conversation_read_returns_new_total(self, client, auth_headers):
        """Test that mark-as-read response includes new total unread count."""
        response = client.post(
            "/messages/conversations/conv-1/read", headers=auth_headers
        )

        data = response.json()
        # After marking conv-1 (2 unread) as read, total should be 3
        assert data["data"]["unreadCount"] == 3

    def test_mark_conversation_read_updates_conversation(self, client, auth_headers):
        """Test that conversation unreadCount is set to 0."""
        # Mark as read
        client.post("/messages/conversations/conv-1/read", headers=auth_headers)

        # Get conversations and check
        response = client.get("/messages/conversations", headers=auth_headers)
        conversations = response.json()["data"]
        conv1 = next((c for c in conversations if c["id"] == "conv-1"), None)

        assert conv1 is not None
        assert conv1["unreadCount"] == 0

    def test_mark_nonexistent_conversation(self, client, auth_headers):
        """Test marking non-existent conversation returns 404."""
        response = client.post(
            "/messages/conversations/invalid/read", headers=auth_headers
        )
        assert response.status_code == 404


class TestMarkAllConversationsRead:
    """Tests for marking all conversations as read."""

    def test_mark_all_read(self, client, auth_headers):
        """Test marking all conversations as read."""
        response = client.post("/messages/read-all", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["unreadCount"] == 0

    def test_mark_all_read_clears_all(self, client, auth_headers):
        """Test that mark all clears unread count in all conversations."""
        # Mark all as read
        client.post("/messages/read-all", headers=auth_headers)

        # Check total is 0
        response = client.get("/messages/unread-count", headers=auth_headers)
        assert response.json()["data"]["unreadCount"] == 0
