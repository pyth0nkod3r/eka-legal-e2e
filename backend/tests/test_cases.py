"""Tests for cases endpoints."""


def test_get_my_cases_unauthorized(client):
    """Test getting cases without auth."""
    response = client.get("/cases")
    assert response.status_code == 401


def test_get_my_cases(client, auth_headers):
    """Test getting user's cases."""
    response = client.get("/cases", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) == 2


def test_get_cases_by_status(client, auth_headers):
    """Test getting cases filtered by status."""
    response = client.get("/cases?status=active", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert all(c["status"] == "active" for c in data["data"])


def test_get_case_by_id(client, auth_headers):
    """Test getting a specific case."""
    response = client.get("/cases/case-1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == "case-1"
    assert data["data"]["title"] == "Business Contract Review"


def test_get_case_not_found(client, auth_headers):
    """Test getting non-existent case."""
    response = client.get("/cases/invalid-id", headers=auth_headers)
    assert response.status_code == 404
