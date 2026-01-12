import pytest
from httpx import AsyncClient
from app.models.messaging import Conversation, ConversationParticipant
from app.repositories import user as user_repo
from app.repositories import messaging as messaging_repo
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_client_messages_display_avatar_and_role(
    async_client: AsyncClient, db_session, user_token, admin_token
):
    """Test that conversations return participant details including avatarUrl and role."""

    # 1. Setup Data
    # Get Admin User (participant 1)
    admin = await user_repo.get_user_by_id(db_session, "admin-1")
    # Get Client User (participant 2)
    client = await user_repo.get_user_by_id(db_session, "user-1")

    # Ensure admin has an avatar set for verification
    admin.avatar_url = "/uploads/admin-avatar.jpg"
    db_session.add(admin)
    await db_session.commit()

    # Create Conversation
    conv = Conversation(
        id="conv-display-test",
        unread_count=0,
        last_message_at=datetime.now(timezone.utc),
    )
    await messaging_repo.add_conversation(db_session, conv)

    # Add participants
    p1 = ConversationParticipant(
        conversation_id=conv.id, user_id=client.id, name=client.name, role="client"
    )
    p2 = ConversationParticipant(
        conversation_id=conv.id, user_id=admin.id, name=admin.name, role="admin"
    )
    db_session.add_all([p1, p2])
    await db_session.commit()

    # 2. Fetch Conversations as Client
    client_headers = {"Authorization": f"Bearer {user_token}"}
    response = await async_client.get("/messages/conversations", headers=client_headers)
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) >= 1

    # Find our test conversation
    test_conv = next((c for c in data if c["id"] == "conv-display-test"), None)
    assert test_conv is not None

    # 3. Check Admin Participant Details
    participants = test_conv["participants"]
    admin_participant = next((p for p in participants if p["id"] == admin.id), None)
    assert admin_participant is not None

    # ASSERTIONS FOR MISSING FIELDS
    # This is what we expect to fail initially or want to ensure is present
    assert "avatarUrl" in admin_participant, (
        "avatarUrl should be present in participant data"
    )
    assert admin_participant["avatarUrl"] == "/uploads/admin-avatar.jpg"
    assert admin_participant["role"] == "admin"
