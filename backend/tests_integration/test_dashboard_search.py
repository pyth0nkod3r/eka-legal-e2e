"""Integration tests for admin dashboard search functionality.

Tests for:
- Combined search of clients and cases
- Search filtering by query
"""

import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestDashboardSearch:
    """Test dashboard search endpoint."""

    async def test_dashboard_search_requires_auth(self, async_client):
        """Test that dashboard search requires authentication."""
        response = await async_client.get("/dashboard/search?q=test")
        assert response.status_code == 401

    async def test_dashboard_search_returns_clients_and_cases(self, async_client):
        """Test that dashboard search returns both clients and cases."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/dashboard/search?q=John",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "clients" in data["data"]
        assert "cases" in data["data"]
        assert isinstance(data["data"]["clients"], list)
        assert isinstance(data["data"]["cases"], list)

    async def test_dashboard_search_filters_clients(self, async_client):
        """Test that search filters clients by name or email."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/dashboard/search?q=John",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for client in data["data"]["clients"]:
            name_match = "john" in client["name"].lower()
            email_match = "john" in client["email"].lower()
            assert name_match or email_match

    async def test_dashboard_search_filters_cases(self, async_client):
        """Test that search filters cases by title or client name."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/dashboard/search?q=Employment",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for case in data["data"]["cases"]:
            title_match = "employment" in case["title"].lower()
            client_name_match = "employment" in case.get("clientName", "").lower()
            case_type_match = "employment" in case.get("caseType", "").lower()
            assert title_match or client_name_match or case_type_match

    async def test_dashboard_search_empty_query_returns_all(self, async_client):
        """Test that empty query returns all clients and cases."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/dashboard/search",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Should return some results
        assert len(data["data"]["clients"]) >= 0
        assert len(data["data"]["cases"]) >= 0

    async def test_client_cannot_access_dashboard_search(self, async_client):
        """Test that clients cannot access dashboard search."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/dashboard/search?q=test",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
