"""Tests for messages endpoints."""


def test_get_conversations_unauthorized(client):
    """Test getting conversations without auth."""
    response = client.get("/messages/conversations")
    assert response.status_code == 401


def test_get_conversations(client, auth_headers):
    """Test getting user's conversations."""
    response = client.get("/messages/conversations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_get_messages(client, auth_headers):
    """Test getting messages for a conversation."""
    response = client.get("/messages/conversations/conv-1/messages", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_get_messages_not_found(client, auth_headers):
    """Test getting messages for non-existent conversation."""
    response = client.get("/messages/conversations/invalid/messages", headers=auth_headers)
    assert response.status_code == 404


def test_send_message(client, auth_headers):
    """Test sending a message."""
    response = client.post(
        "/messages/conversations/conv-1/messages",
        json={"content": "This is a test message"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["content"] == "This is a test message"


def test_mark_messages_as_read(client, auth_headers):
    """Test marking messages as read."""
    response = client.post(
        "/messages/read",
        json={"messageIds": ["msg-1", "msg-2"]},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
