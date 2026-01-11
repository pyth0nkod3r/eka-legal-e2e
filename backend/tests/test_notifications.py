"""Tests for notification endpoints and unread count behavior."""

import pytest
from app.models import NOTIFICATIONS


@pytest.fixture(autouse=True)
def reset_notifications():
    """Reset notifications to known state before each test."""
    # Store original state
    original = {k: [n.copy() for n in v] for k, v in NOTIFICATIONS.items()}
    
    # Reset to known state with unread notifications
    NOTIFICATIONS["user-1"] = [
        {
            "id": "notif-1",
            "type": "appointment",
            "title": "Upcoming Consultation",
            "message": "You have a consultation scheduled",
            "read": False,
            "createdAt": "2024-01-01T10:00:00Z",
            "link": "/dashboard/appointments",
        },
        {
            "id": "notif-2",
            "type": "message",
            "title": "New Message",
            "message": "You have a new message",
            "read": False,
            "createdAt": "2024-01-01T14:00:00Z",
            "link": "/dashboard/messages",
        },
        {
            "id": "notif-3",
            "type": "document",
            "title": "Document Ready",
            "message": "Your document is ready for review",
            "read": True,  # Already read
            "createdAt": "2024-01-01T09:00:00Z",
            "link": "/dashboard/documents",
        },
    ]
    
    yield
    
    # Restore original state
    NOTIFICATIONS.clear()
    NOTIFICATIONS.update(original)


class TestGetNotifications:
    """Tests for GET /notifications endpoint."""
    
    def test_get_notifications_returns_all(self, client, auth_headers):
        """Test getting notifications returns all user notifications."""
        response = client.get("/notifications", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        assert len(data["data"]) == 3
    
    def test_get_notifications_includes_read_status(self, client, auth_headers):
        """Test that notifications include read status."""
        response = client.get("/notifications", headers=auth_headers)
        
        data = response.json()
        notifications = data["data"]
        
        # Check read statuses
        read_statuses = {n["id"]: n["read"] for n in notifications}
        assert read_statuses["notif-1"] is False
        assert read_statuses["notif-2"] is False
        assert read_statuses["notif-3"] is True


class TestUnreadCount:
    """Tests for notification unread count endpoint."""
    
    def test_get_unread_count(self, client, auth_headers):
        """Test getting unread notification count."""
        response = client.get("/notifications/unread-count", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["unreadCount"] == 2  # notif-1 and notif-2 are unread
    
    def test_unread_count_zero_when_all_read(self, client, auth_headers):
        """Test unread count is zero when all notifications are read."""
        # Mark all as read first
        client.post("/notifications/read-all", headers=auth_headers)
        
        response = client.get("/notifications/unread-count", headers=auth_headers)
        
        data = response.json()
        assert data["data"]["unreadCount"] == 0


class TestMarkNotificationAsRead:
    """Tests for marking individual notifications as read."""
    
    def test_mark_single_notification_read(self, client, auth_headers):
        """Test marking a single notification as read."""
        response = client.post("/notifications/notif-1/read", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_mark_read_decreases_unread_count(self, client, auth_headers):
        """Test that marking a notification as read decreases unread count."""
        # Get initial count
        initial_response = client.get("/notifications/unread-count", headers=auth_headers)
        initial_count = initial_response.json()["data"]["unreadCount"]
        assert initial_count == 2
        
        # Mark one as read
        client.post("/notifications/notif-1/read", headers=auth_headers)
        
        # Check count decreased
        after_response = client.get("/notifications/unread-count", headers=auth_headers)
        after_count = after_response.json()["data"]["unreadCount"]
        assert after_count == 1
    
    def test_mark_read_returns_updated_count(self, client, auth_headers):
        """Test that mark-as-read response includes updated unread count."""
        response = client.post("/notifications/notif-1/read", headers=auth_headers)
        
        data = response.json()
        assert "unreadCount" in data["data"]
        assert data["data"]["unreadCount"] == 1  # Was 2, now 1
    
    def test_mark_already_read_notification(self, client, auth_headers):
        """Test marking an already-read notification."""
        response = client.post("/notifications/notif-3/read", headers=auth_headers)
        
        # Should still succeed
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Count should remain 2 (notif-1 and notif-2)
        assert data["data"]["unreadCount"] == 2
    
    def test_mark_nonexistent_notification(self, client, auth_headers):
        """Test marking a non-existent notification returns 404."""
        response = client.post("/notifications/notif-999/read", headers=auth_headers)
        
        assert response.status_code == 404


class TestMarkAllAsRead:
    """Tests for marking all notifications as read."""
    
    def test_mark_all_as_read(self, client, auth_headers):
        """Test marking all notifications as read."""
        response = client.post("/notifications/read-all", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_mark_all_clears_unread_count(self, client, auth_headers):
        """Test that marking all as read sets unread count to zero."""
        # Verify we have unread notifications
        initial_response = client.get("/notifications/unread-count", headers=auth_headers)
        assert initial_response.json()["data"]["unreadCount"] > 0
        
        # Mark all as read
        client.post("/notifications/read-all", headers=auth_headers)
        
        # Check count is now 0
        after_response = client.get("/notifications/unread-count", headers=auth_headers)
        assert after_response.json()["data"]["unreadCount"] == 0
    
    def test_mark_all_returns_updated_count(self, client, auth_headers):
        """Test that mark-all-as-read response includes updated count."""
        response = client.post("/notifications/read-all", headers=auth_headers)
        
        data = response.json()
        assert "unreadCount" in data["data"]
        assert data["data"]["unreadCount"] == 0
    
    def test_all_notifications_marked_read(self, client, auth_headers):
        """Test that all notifications are actually marked as read."""
        # Mark all as read
        client.post("/notifications/read-all", headers=auth_headers)
        
        # Get all notifications and verify read status
        response = client.get("/notifications", headers=auth_headers)
        notifications = response.json()["data"]
        
        for notif in notifications:
            assert notif["read"] is True, f"Notification {notif['id']} should be marked as read"
