"""Tests for admin dashboard actions.

These tests verify that admin action endpoints work correctly for:
- Client management
- Case management
- Document management
- Calendar/booking management
"""


class TestAdminClientActions:
    """Tests for admin client management actions."""

    def test_get_clients_list(self, client, lawyer_auth_headers):
        """Test getting list of clients."""
        # The lawyer should be able to see their clients
        response = client.get("/cases", headers=lawyer_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_get_messages_for_client_communication(self, client, lawyer_auth_headers):
        """Test that message endpoint works for sending messages to clients."""
        response = client.get("/messages/conversations", headers=lawyer_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)


class TestAdminCaseActions:
    """Tests for admin case management actions."""

    def test_get_all_cases(self, client, lawyer_auth_headers):
        """Test getting all cases as lawyer."""
        response = client.get("/cases", headers=lawyer_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_get_case_documents(self, client, lawyer_auth_headers):
        """Test getting documents for a specific case."""
        # First get a case
        response = client.get("/cases", headers=lawyer_auth_headers)
        assert response.status_code == 200
        cases = response.json()["data"]
        
        if len(cases) > 0:
            case_id = cases[0]["id"]
            # Try to get documents for this case
            response = client.get(f"/cases/{case_id}/documents", headers=lawyer_auth_headers)
            assert response.status_code == 200

    def test_filter_cases_by_status(self, client, lawyer_auth_headers):
        """Test filtering cases by status."""
        for status in ["active", "pending", "closed"]:
            response = client.get(f"/cases?status={status}", headers=lawyer_auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            # All returned cases should have the filtered status
            for case in data["data"]:
                assert case["status"] == status


class TestAdminCalendarActions:
    """Tests for admin calendar/booking management actions."""

    def test_get_bookings(self, client, lawyer_auth_headers):
        """Test getting all bookings."""
        response = client.get("/booking/bookings", headers=lawyer_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_get_consultation_types(self, client):
        """Test getting consultation types (public endpoint)."""
        response = client.get("/booking/consultation-types")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_get_available_slots(self, client):
        """Test getting available slots for a date."""
        response = client.get("/booking/available-slots?date=2025-01-15")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)


class TestAdminDocumentActions:
    """Tests for admin document management actions."""

    def test_get_documents(self, client, lawyer_auth_headers):
        """Test getting documents as admin."""
        # Get cases first to find documents
        response = client.get("/cases", headers=lawyer_auth_headers)
        assert response.status_code == 200
        cases = response.json()["data"]
        
        # Cases should have documents array
        for case in cases:
            assert "documents" in case
            assert isinstance(case["documents"], list)

    def test_documents_endpoint_requires_auth(self, client):
        """Test that document actions require authentication."""
        response = client.post("/cases/case-1/documents")
        assert response.status_code == 401


class TestAdminDashboardStats:
    """Tests for admin dashboard statistics."""

    def test_get_lawyer_stats(self, client, lawyer_auth_headers):
        """Test getting lawyer dashboard stats."""
        response = client.get("/dashboard/lawyer/stats", headers=lawyer_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Check expected fields
        stats = data["data"]
        assert "activeCase" in stats or "activeCases" in stats
        assert "totalClients" in stats
        assert "upcomingAppointments" in stats
