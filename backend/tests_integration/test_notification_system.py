"""Integration tests for notification system.

Tests for:
1. Admin actions creating notifications for clients
2. Notification counts updating correctly
"""

import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestAdminActionNotifications:
    """Test that admin actions create notifications for clients."""

    async def test_booking_status_change_creates_notification(self, async_client):
        """Test that changing booking status notifies the client."""
        admin_token = create_access_token(
            {"sub": "lawyer-1", "email": "uti@eka-legal.com"}
        )
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        # Get initial notification count for client
        initial_res = await async_client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        initial_count = len(initial_res.json()["data"])

        # Admin updates booking status
        await async_client.patch(
            "/booking/bookings/booking-1",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Client should have a new notification
        after_res = await async_client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        after_count = len(after_res.json()["data"])

        assert after_count > initial_count

    async def test_case_status_change_creates_notification(self, async_client):
        """Test that changing case status notifies the client."""
        admin_token = create_access_token(
            {"sub": "lawyer-1", "email": "uti@eka-legal.com"}
        )
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        # Get initial notification count for client
        initial_res = await async_client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        initial_count = len(initial_res.json()["data"])

        # Admin updates case status
        await async_client.patch(
            "/cases/case-1",
            json={"status": "active"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Client should have a new notification
        after_res = await async_client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        after_count = len(after_res.json()["data"])

        assert after_count > initial_count


@pytest.mark.asyncio
class TestNotificationMarkAsRead:
    """Test marking notifications as read."""

    async def test_mark_single_notification_as_read(self, async_client):
        """Test that marking a notification as read updates count."""
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        # Get notifications
        res = await async_client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        notifications = res.json()["data"]

        if len(notifications) > 0:
            notif_id = notifications[0]["id"]

            # Mark as read
            mark_res = await async_client.post(
                f"/notifications/{notif_id}/read",
                headers={"Authorization": f"Bearer {client_token}"},
            )

            assert mark_res.status_code == 200
            assert "unreadCount" in mark_res.json()["data"]

    async def test_mark_all_notifications_as_read(self, async_client):
        """Test that marking all notifications as read returns zero count."""
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        # Mark all as read
        res = await async_client.post(
            "/notifications/read-all",
            headers={"Authorization": f"Bearer {client_token}"},
        )

        assert res.status_code == 200
        assert res.json()["data"]["unreadCount"] == 0


@pytest.mark.asyncio
class TestConversationUnreadCount:
    """Test conversation unread count behavior."""

    async def test_marking_conversation_read_updates_count(self, async_client):
        """Test that marking a conversation as read updates the count."""
        client_token = create_access_token(
            {"sub": "user-1", "email": "john.doe@email.com"}
        )

        # Get conversations
        conv_res = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        conversations = conv_res.json()["data"]

        if len(conversations) > 0:
            conv_id = conversations[0]["id"]

            # Mark conversation as read
            read_res = await async_client.post(
                f"/messages/conversations/{conv_id}/read",
                headers={"Authorization": f"Bearer {client_token}"},
            )

            assert read_res.status_code == 200
            assert "unreadCount" in read_res.json()["data"]
