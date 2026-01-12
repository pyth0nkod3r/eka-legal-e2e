import pytest
from datetime import datetime, timedelta, timezone


@pytest.mark.asyncio
async def test_delete_message_success(client, auth_headers, db_session):
    # Create a message
    response = client.post(
        "/messages/conversations/conv-1/messages",
        json={"content": "Delete me"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    msg_id = response.json()["data"]["id"]

    # Delete it immediately
    del_response = client.delete(
        f"/messages/conversations/conv-1/messages/{msg_id}",
        headers=auth_headers,
    )
    assert del_response.status_code == 200
    assert del_response.json()["data"]["content"] == "This message was deleted"
    assert del_response.json()["data"]["deletedAt"] is not None


@pytest.mark.asyncio
async def test_delete_message_too_late(client, auth_headers, db_session):
    # Create a message
    response = client.post(
        "/messages/conversations/conv-1/messages",
        json={"content": "Too late to delete"},
        headers=auth_headers,
    )
    msg_id = response.json()["data"]["id"]

    # Manually update timestamp to be old
    from sqlalchemy import text
    # This is a bit hacky but we need to bypass the API to backdate
    # Or we can just mock the time in the endpoint, but updating DB is more robust integration test
    # Assuming we have access to db_session from fixture

    # We'll use sql because accessing the object might be detached
    await db_session.execute(
        text("UPDATE messages SET timestamp = :ts WHERE id = :id"),
        {"ts": datetime.now(timezone.utc) - timedelta(minutes=5), "id": msg_id},
    )
    await db_session.commit()

    # Try to delete
    del_response = client.delete(
        f"/messages/conversations/conv-1/messages/{msg_id}",
        headers=auth_headers,
    )
    assert del_response.status_code == 400
    assert "after 3 minutes" in del_response.json()["detail"]


@pytest.mark.asyncio
async def test_edit_message_success(client, auth_headers):
    # Create
    response = client.post(
        "/messages/conversations/conv-1/messages",
        json={"content": "Original content"},
        headers=auth_headers,
    )
    msg_id = response.json()["data"]["id"]

    # Edit
    edit_response = client.put(
        f"/messages/conversations/conv-1/messages/{msg_id}",
        json={"content": "Edited content"},
        headers=auth_headers,
    )
    assert edit_response.status_code == 200
    assert edit_response.json()["data"]["content"] == "Edited content"
    assert edit_response.json()["data"]["editedAt"] is not None


@pytest.mark.asyncio
async def test_edit_message_too_late(client, auth_headers, db_session):
    # Create
    response = client.post(
        "/messages/conversations/conv-1/messages",
        json={"content": "Original content"},
        headers=auth_headers,
    )
    msg_id = response.json()["data"]["id"]

    # Manually update timestamp
    from sqlalchemy import text

    await db_session.execute(
        text("UPDATE messages SET timestamp = :ts WHERE id = :id"),
        {"ts": datetime.now(timezone.utc) - timedelta(minutes=5), "id": msg_id},
    )
    await db_session.commit()

    # Edit
    edit_response = client.put(
        f"/messages/conversations/conv-1/messages/{msg_id}",
        json={"content": "Edited content"},
        headers=auth_headers,
    )
    assert edit_response.status_code == 400
    assert "after 3 minutes" in edit_response.json()["detail"]
