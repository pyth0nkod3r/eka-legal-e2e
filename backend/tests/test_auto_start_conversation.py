import pytest


@pytest.mark.asyncio
async def test_auto_start_conversation_creates_new(client, auth_headers, db_session):
    """Test that start-with-admin creates a new conversation if none exists."""
    # Delete existing conversation for this user seeded in conftest
    from sqlalchemy import text

    await db_session.execute(text("DELETE FROM conversations"))
    await db_session.commit()

    response = client.post(
        "/messages/conversations/start-with-admin", headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Conversation created"

    participants = data["data"]["participants"]

    # Verify participants
    role_set = {p["role"] for p in participants}
    assert "client" in role_set
    # The other role should be admin or lawyer, depending on what get_admin_or_lawyer returns.
    # In test fixtures, we usually have an admin.
    assert "admin" in role_set or "lawyer" in role_set


@pytest.mark.asyncio
async def test_auto_start_conversation_returns_existing(client, auth_headers):
    """Test that start-with-admin returns existing conversation if one exists."""
    # First call to create
    response1 = client.post(
        "/messages/conversations/start-with-admin", headers=auth_headers
    )
    assert response1.status_code == 201
    conv_id1 = response1.json()["data"]["id"]

    # Second call should return the same
    response2 = client.post(
        "/messages/conversations/start-with-admin", headers=auth_headers
    )
    assert response2.status_code == 201
    data2 = response2.json()

    assert data2["message"] == "Conversation already exists"
    assert data2["data"]["id"] == conv_id1
