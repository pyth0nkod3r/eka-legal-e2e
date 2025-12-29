"""Pytest configuration."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Create authentication headers for test user."""
    token = create_access_token(data={"sub": "user-1", "email": "john.doe@email.com"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lawyer_auth_headers():
    """Create authentication headers for lawyer user."""
    token = create_access_token(data={"sub": "lawyer-1", "email": "uti@eka-legal.com"})
    return {"Authorization": f"Bearer {token}"}
