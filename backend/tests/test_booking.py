"""Tests for booking endpoints."""


def test_get_consultation_types(client):
    """Test getting consultation types."""
    response = client.get("/booking/consultation-types")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) == 3
    assert data["data"][0]["name"] == "Initial Consultation"


def test_get_available_slots(client):
    """Test getting available time slots."""
    response = client.get("/booking/available-slots?date=2025-01-15")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) == 7  # 7 time slots per day


def test_get_my_bookings_unauthorized(client):
    """Test getting bookings without auth."""
    response = client.get("/booking/bookings")
    assert response.status_code == 401


def test_get_my_bookings(client, auth_headers):
    """Test getting user's bookings."""
    response = client.get("/booking/bookings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_create_booking(client):
    """Test creating a new booking."""
    response = client.post(
        "/booking/bookings",
        json={
            "consultationTypeId": "consult-1",
            "date": "2025-02-01",
            "time": "10:00",
            "name": "Test Client",
            "email": "test@email.com",
            "reason": "Need legal consultation",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "pending"
    assert data["data"]["clientEmail"] == "test@email.com"


def test_create_booking_invalid_type(client):
    """Test creating booking with invalid consultation type."""
    response = client.post(
        "/booking/bookings",
        json={
            "consultationTypeId": "invalid-id",
            "date": "2025-02-01",
            "time": "10:00",
            "name": "Test Client",
            "email": "test@email.com",
            "reason": "Need legal consultation",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is False


def test_cancel_booking(client, auth_headers):
    """Test canceling a booking."""
    response = client.delete("/booking/bookings/booking-1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
