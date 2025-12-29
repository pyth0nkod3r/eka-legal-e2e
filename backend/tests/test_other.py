"""Tests for notifications, dashboard, and intake endpoints."""


# Notifications tests
def test_get_notifications_unauthorized(client):
    """Test getting notifications without auth."""
    response = client.get("/notifications")
    assert response.status_code == 401


def test_get_notifications(client, auth_headers):
    """Test getting user's notifications."""
    response = client.get("/notifications", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_mark_notification_as_read(client, auth_headers):
    """Test marking a notification as read."""
    response = client.post("/notifications/notif-1/read", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_mark_all_notifications_as_read(client, auth_headers):
    """Test marking all notifications as read."""
    response = client.post("/notifications/read-all", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


# Dashboard tests
def test_get_client_stats(client, auth_headers):
    """Test getting client dashboard stats."""
    response = client.get("/dashboard/client/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "activeCase" in data["data"]
    assert "upcomingAppointments" in data["data"]


def test_get_lawyer_stats(client, lawyer_auth_headers):
    """Test getting lawyer dashboard stats."""
    response = client.get("/dashboard/lawyer/stats", headers=lawyer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["totalClients"] == 24


# Intake tests
def test_submit_intake_form(client):
    """Test submitting intake form."""
    response = client.post(
        "/intake",
        json={
            "personalInfo": {
                "name": "Test Client",
                "email": "test@email.com",
                "phone": "555-1234",
                "preferredContact": "email",
            },
            "caseType": "Contract Law",
            "urgency": "medium",
            "description": "I need help with a contract dispute.",
            "consent": True,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "caseId" in data["data"]


def test_save_intake_draft(client, auth_headers):
    """Test saving intake draft."""
    response = client.post(
        "/intake/draft",
        json={
            "personalInfo": {
                "name": "Draft User",
                "email": "draft@email.com",
                "phone": "555-5678",
                "preferredContact": "phone",
            },
            "caseType": "Estate Planning",
            "urgency": "low",
            "description": "Draft description",
            "consent": True,
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_get_intake_draft(client, auth_headers):
    """Test getting intake draft."""
    response = client.get("/intake/draft", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


# Health check
def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "name" in response.json()
