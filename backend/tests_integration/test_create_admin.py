import pytest
from app.models.user import User
from app.schemas import UserRole
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_create_admin_success(async_client, db_session):
    payload = {
        "name": "New Admin",
        "email": "newadmin@example.com",
        "password": "strongAdminPassword123!",
        "phone": "+19998887777",
    }

    response = await async_client.post("/auth/create-admin", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == payload["email"]
    assert data["data"]["user"]["role"] == "admin"

    # Verify login works
    login_payload = {"email": payload["email"], "password": payload["password"]}
    login_response = await async_client.post("/auth/login", json=login_payload)
    assert login_response.status_code == 200
    assert login_response.json()["success"] is True


@pytest.mark.asyncio
async def test_create_admin_duplicate_email(async_client):
    # Setup existing user
    payload = {
        "name": "Admin Two",
        "email": "existingadmin@example.com",
        "password": "password123",
        "phone": "+19998887777",
    }

    await async_client.post("/auth/create-admin", json=payload)

    # Try creating again
    response = await async_client.post("/auth/create-admin", json=payload)
    assert response.status_code == 400
