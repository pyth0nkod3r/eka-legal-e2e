"""Tests for public endpoints."""


def test_get_lawyer_profile(client):
    """Test getting lawyer profile."""
    response = client.get("/public/lawyer-profile")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Eka Utibe, Esq."
    assert "practiceAreas" in data["data"]


def test_get_services(client):
    """Test getting services list."""
    response = client.get("/public/services")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) > 0
    assert "title" in data["data"][0]


def test_get_testimonials(client):
    """Test getting testimonials."""
    response = client.get("/public/testimonials")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_get_faqs(client):
    """Test getting FAQs."""
    response = client.get("/public/faqs")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert "question" in data["data"][0]
    assert "answer" in data["data"][0]


def test_submit_contact_form(client):
    """Test submitting contact form."""
    response = client.post(
        "/public/contact",
        json={
            "name": "Test User",
            "email": "test@email.com",
            "message": "I need legal help.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Thank you" in data["message"]
