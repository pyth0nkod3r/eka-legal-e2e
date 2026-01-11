"""Tests for authentication endpoints."""


def test_login_success(client):
    """Test successful login."""
    response = client.post(
        "/auth/login",
        json={"email": "john.doe@email.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data["data"]
    assert data["data"]["user"]["email"] == "john.doe@email.com"


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post(
        "/auth/login",
        json={"email": "john.doe@email.com", "password": "wrongpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "Invalid" in data["message"]


def test_register_success(client):
    """Test successful registration."""
    response = client.post(
        "/auth/register",
        json={
            "name": "New User",
            "email": "newuser@email.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "newuser@email.com"
    assert data["data"]["user"]["role"] == "client"


def test_register_duplicate_email(client):
    """Test registration with existing email."""
    response = client.post(
        "/auth/register",
        json={
            "name": "Another User",
            "email": "john.doe@email.com",
            "password": "password123",
        },
    )
    assert response.status_code == 400
    data = response.json()
    assert "already registered" in data["detail"]


def test_get_current_user(client, auth_headers):
    """Test getting current user profile."""
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "john.doe@email.com"


def test_get_current_user_unauthorized(client):
    """Test getting current user without auth."""
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_logout(client, auth_headers):
    """Test logout."""
    response = client.post("/auth/logout", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_forgot_password(client):
    """Test forgot password."""
    response = client.post(
        "/auth/forgot-password",
        json={"email": "john.doe@email.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_reset_password(client):
    """Test reset password."""
    response = client.post(
        "/auth/reset-password",
        json={"token": "test-token", "password": "newpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
