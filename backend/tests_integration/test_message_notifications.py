import pytest
from httpx import AsyncClient
from app.models.messaging import Conversation, ConversationParticipant
from app.repositories import user as user_repo
from app.repositories import messaging as messaging_repo
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_message_notifications(
    async_client: AsyncClient, db_session, admin_token, lawyer_token, user_token
):
    """Test notifications are created when clients send messages."""

    # 1. Setup Data
    # Get Lawyer User (recipient)
    lawyer = await user_repo.get_user_by_id(db_session, "lawyer-1")
    # Get Client User (sender)
    client = await user_repo.get_user_by_id(db_session, "user-1")

    # Create Conversation
    conv = Conversation(
        id="conv-notif-test", unread_count=0, last_message_at=datetime.now(timezone.utc)
    )
    await messaging_repo.add_conversation(db_session, conv)

    # Add participants
    p1 = ConversationParticipant(
        conversation_id=conv.id, user_id=client.id, name=client.name, role="client"
    )
    p2 = ConversationParticipant(
        conversation_id=conv.id, user_id=lawyer.id, name=lawyer.name, role="lawyer"
    )
    db_session.add_all([p1, p2])
    await db_session.commit()

    # 2. Client Sends Message
    client_headers = {"Authorization": f"Bearer {user_token}"}
    payload = {"content": "Hello Lawyer, I need help!"}

    response = await async_client.post(
        f"/messages/conversations/{conv.id}/messages",
        json=payload,
        headers=client_headers,
    )
    assert response.status_code == 201

    # 3. Check Notification Created for Lawyer
    # We authenticate as lawyer to check notifications
    lawyer_headers = {"Authorization": f"Bearer {lawyer_token}"}

    notif_res = await async_client.get("/notifications", headers=lawyer_headers)
    assert notif_res.status_code == 200
    notifications = notif_res.json()["data"]

    # Needs to find the notification about the message
    msg_notif = next(
        (n for n in notifications if "New message from" in n["title"]), None
    )
    assert msg_notif is not None
    assert "Hello Lawyer" in msg_notif["message"]

    # 4. Check Unread Count for Lawyer
    count_res = await async_client.get("/messages/unread-count", headers=lawyer_headers)
    assert count_res.status_code == 200
    # Should be at least 1 (from this message)
    assert count_res.json()["data"]["unreadCount"] >= 1
    initial_count = count_res.json()["data"]["unreadCount"]

    # 5. Mark Conversation as Read (Lawyer reads it)
    read_res = await async_client.post(
        f"/messages/conversations/{conv.id}/read", headers=lawyer_headers
    )
    assert read_res.status_code == 200

    # 6. Check Unread Count Decreased
    final_count = read_res.json()["data"]["unreadCount"]
    assert final_count < initial_count
