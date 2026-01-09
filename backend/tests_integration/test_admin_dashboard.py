"""Integration tests for admin dashboard functionality.

Tests for:
- Booking status update endpoint
- Case status update endpoint  
- Conversation creation endpoint
- Dashboard stats including pending cases
"""

import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestBookingStatusUpdate:
    """Test booking status update endpoint."""
    
    async def test_lawyer_can_update_booking_status(self, async_client):
        """Test that a lawyer can update booking status."""
        # Use mock lawyer credentials
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # Update booking status to confirmed
        response = await async_client.patch(
            "/booking/bookings/booking-1",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "confirmed"
    
    async def test_client_cannot_update_booking_status(self, async_client):
        """Test that a client cannot update booking status."""
        # Use mock client credentials
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.patch(
            "/booking/bookings/booking-1",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
    
    async def test_update_nonexistent_booking(self, async_client):
        """Test updating a booking that doesn't exist."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.patch(
            "/booking/bookings/nonexistent-booking",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404


@pytest.mark.asyncio
class TestCaseStatusUpdate:
    """Test case status update endpoint."""
    
    async def test_lawyer_can_update_case_status(self, async_client):
        """Test that a lawyer can update case status."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.patch(
            "/cases/case-1",
            json={"status": "closed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "closed"
        # Check that clientName is included
        assert "clientName" in data["data"]
    
    async def test_client_cannot_update_case_status(self, async_client):
        """Test that a client cannot update case status."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.patch(
            "/cases/case-1",
            json={"status": "closed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
    
    async def test_case_response_includes_client_name(self, async_client):
        """Test that case responses include clientName."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/cases",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # All cases should have clientName
        for case in data["data"]:
            assert "clientName" in case


@pytest.mark.asyncio
class TestConversationCreation:
    """Test conversation creation endpoint."""
    
    async def test_lawyer_can_create_conversation(self, async_client):
        """Test that a lawyer can create a conversation with a client."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.post(
            "/messages/conversations",
            json={"clientId": "user-1"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert len(data["data"]["participants"]) == 2
    
    async def test_client_cannot_create_conversation(self, async_client):
        """Test that a client cannot create a conversation."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.post(
            "/messages/conversations",
            json={"clientId": "user-1"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
    
    async def test_create_conversation_nonexistent_client(self, async_client):
        """Test that creating a conversation with nonexistent client fails."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.post(
            "/messages/conversations",
            json={"clientId": "nonexistent-user"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404


@pytest.mark.asyncio
class TestDashboardStats:
    """Test dashboard stats endpoint."""
    
    async def test_lawyer_stats_includes_pending_cases(self, async_client):
        """Test that lawyer dashboard stats include pendingCases."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/dashboard/lawyer/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Check all required fields are present
        assert "totalClients" in data["data"]
        assert "activeCase" in data["data"]
        assert "pendingCases" in data["data"]
        assert "upcomingAppointments" in data["data"]
        assert "pendingDocuments" in data["data"]
        assert "appointmentsThisWeek" in data["data"]
        # pendingCases should be a number >= 0
        assert isinstance(data["data"]["pendingCases"], int)
        assert data["data"]["pendingCases"] >= 0


@pytest.mark.asyncio
class TestViewBookingDetails:
    """Test viewing individual booking details."""
    
    async def test_get_all_bookings_as_lawyer(self, async_client):
        """Test that a lawyer can get all bookings."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/booking/bookings",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # Each booking should have required fields
        for booking in data["data"]:
            assert "id" in booking
            assert "clientName" in booking
            assert "clientEmail" in booking
            assert "date" in booking
            assert "time" in booking
            assert "status" in booking
            assert "consultationType" in booking
    
    async def test_booking_includes_consultation_type_details(self, async_client):
        """Test that bookings include consultation type with name and duration."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/booking/bookings",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        if data["data"]:  # If there are any bookings
            booking = data["data"][0]
            assert "consultationType" in booking
            assert "name" in booking["consultationType"]
            assert "duration" in booking["consultationType"]


@pytest.mark.asyncio
class TestCaseDocumentsAndDetails:
    """Test case documents and details."""
    
    async def test_get_case_by_id(self, async_client):
        """Test that a lawyer can get a specific case by ID."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/cases/case-1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert "clientName" in data["data"]
        assert "title" in data["data"]
        assert "documents" in data["data"]
        assert isinstance(data["data"]["documents"], list)
    
    async def test_case_documents_have_required_fields(self, async_client):
        """Test that case documents have required fields."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/cases/case-1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        # Verify documents structure (may be empty but should be a list)
        assert isinstance(data["data"]["documents"], list)
        for doc in data["data"]["documents"]:
            assert "id" in doc
            assert "name" in doc
            assert "type" in doc
    
    async def test_get_single_case_includes_client_name(self, async_client):
        """Test that getting a single case includes clientName."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/cases/case-1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "clientName" in data["data"]
        # clientName should not be empty for valid cases
        assert data["data"]["clientName"]


@pytest.mark.asyncio
class TestMessagingFlows:
    """Test messaging-related flows from dashboard navigation."""
    
    async def test_get_conversations(self, async_client):
        """Test getting all conversations."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        for conv in data["data"]:
            assert "id" in conv
            assert "participants" in conv
    
    async def test_create_and_get_conversation(self, async_client):
        """Test creating a conversation and then getting it."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # Create a conversation
        create_response = await async_client.post(
            "/messages/conversations",
            json={"clientId": "user-1"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert create_response.status_code in [200, 201]  # May already exist
        conv_data = create_response.json()
        assert conv_data["success"] is True
        assert "id" in conv_data["data"]
        
        # Now get conversations and verify it's there
        get_response = await async_client.get(
            "/messages/conversations",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert any(c["id"] == conv_data["data"]["id"] for c in get_data["data"])


@pytest.mark.asyncio
class TestClientActions:
    """Test client actions from admin dashboard (View Profile, Send Message, View Cases)."""
    
    async def test_get_client_profile(self, async_client):
        """Test that a lawyer can view a specific client's profile."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/clients/user-1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert "name" in data["data"]
        assert "email" in data["data"]
        # Verify password_hash is not exposed
        assert "password_hash" not in data["data"]
    
    async def test_get_client_profile_not_found(self, async_client):
        """Test that getting a non-existent client returns 404."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/clients/nonexistent-client",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404
    
    async def test_client_cannot_view_other_client_profile(self, async_client):
        """Test that a client cannot view another client's profile."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.get(
            "/clients/user-2",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
    
    async def test_get_cases_filtered_by_client(self, async_client):
        """Test that a lawyer can filter cases by client ID."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # Get all cases first
        all_response = await async_client.get(
            "/cases",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert all_response.status_code == 200
        all_cases = all_response.json()["data"]
        
        # Now filter by client
        filtered_response = await async_client.get(
            "/cases?client_id=user-1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert filtered_response.status_code == 200
        filtered_data = filtered_response.json()
        assert filtered_data["success"] is True
        
        # All filtered cases should belong to user-1
        for case in filtered_data["data"]:
            assert case["clientId"] == "user-1"
        
        # Filtered cases should be subset of or equal to all cases
        assert len(filtered_data["data"]) <= len(all_cases)
    
    async def test_send_message_to_client_creates_conversation(self, async_client):
        """Test that sending a message to a client creates/returns a conversation."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # Create a conversation with a client
        response = await async_client.post(
            "/messages/conversations",
            json={"clientId": "user-1"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert "participants" in data["data"]
        
        # Verify both lawyer and client are participants
        participant_ids = [p.get("id") for p in data["data"]["participants"]]
        assert "user-1" in participant_ids


@pytest.mark.asyncio
class TestClientStatusUpdate:
    """Test client status update endpoint."""
    
    async def test_lawyer_can_update_client_status(self, async_client):
        """Test that a lawyer can update client status."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.patch(
            "/clients/user-1",
            json={"status": "closed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "closed"
        assert "password_hash" not in data["data"]
    
    async def test_client_cannot_update_client_status(self, async_client):
        """Test that a client cannot update their own status."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.patch(
            "/clients/user-1",
            json={"status": "closed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
    
    async def test_update_nonexistent_client(self, async_client):
        """Test updating a client that doesn't exist."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.patch(
            "/clients/nonexistent-client",
            json={"status": "closed"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404
    
    async def test_client_response_includes_status(self, async_client):
        """Test that client responses include status field."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/clients",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # All clients should have status field
        for client in data["data"]:
            assert "status" in client


@pytest.mark.asyncio
class TestDocumentUploadWithTags:
    """Test document upload with tag functionality."""
    
    async def test_lawyer_can_upload_document_with_tag(self, async_client):
        """Test that a lawyer can upload a document with a tag."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # Create a simple file-like object
        response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            data={"tag": "contract"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert data["data"]["tag"] == "contract"
    
    async def test_upload_document_without_tag(self, async_client):
        """Test that documents can be uploaded without a tag."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["tag"] is None
    
    async def test_client_can_upload_to_own_case(self, async_client):
        """Test that a client can upload to their own case."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            data={"tag": "evidence"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
    
    async def test_client_cannot_upload_to_other_case(self, async_client):
        """Test that a client cannot upload to another client's case."""
        # Create a token for a different user
        token = create_access_token({"sub": "user-999", "email": "other@email.com"})
        
        response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403


@pytest.mark.asyncio
class TestWeeklyAppointments:
    """Test weekly appointments endpoint."""
    
    async def test_lawyer_can_get_weekly_appointments(self, async_client):
        """Test that a lawyer can get weekly appointments."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/booking/appointments-week",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # Verify bookings have required fields
        for booking in data["data"]:
            assert "id" in booking
            assert "clientName" in booking
            assert "date" in booking
            assert "time" in booking
    
    async def test_client_cannot_get_weekly_appointments(self, async_client):
        """Test that a client cannot get weekly appointments."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.get(
            "/booking/appointments-week",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403


@pytest.mark.asyncio
class TestClientSearch:
    """Test client search endpoint."""
    
    async def test_lawyer_can_search_clients(self, async_client):
        """Test that a lawyer can search clients."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/clients/search?q=john",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # All returned clients should match the search query
        for client in data["data"]:
            assert "john" in client.get("name", "").lower() or "john" in client.get("email", "").lower()
            # Password hash should not be exposed
            assert "password_hash" not in client
    
    async def test_search_clients_empty_query_returns_all(self, async_client):
        """Test that empty search query returns all clients."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/clients/search",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
    
    async def test_client_cannot_search_clients(self, async_client):
        """Test that a regular client cannot search for other clients."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})
        
        response = await async_client.get(
            "/clients/search?q=test",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403


@pytest.mark.asyncio
class TestDocumentDownloadAndDelete:
    """Test document download and delete functionality."""
    
    async def test_lawyer_can_delete_document(self, async_client):
        """Test that a lawyer can delete a document."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # First upload a document
        upload_response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("to_delete.pdf", b"delete me", "application/pdf")},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert upload_response.status_code == 201
        doc_id = upload_response.json()["data"]["id"]
        
        # Now delete it
        delete_response = await async_client.delete(
            f"/documents/{doc_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert delete_response.status_code == 200
        assert delete_response.json()["success"] is True
    
    async def test_document_has_url_for_download(self, async_client):
        """Test that uploaded documents have a URL for download."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("downloadable.pdf", b"content", "application/pdf")},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "url" in data["data"]
        assert data["data"]["url"]  # URL should not be empty


@pytest.mark.asyncio
class TestDocumentPreview:
    """Test document preview functionality."""
    
    async def test_get_document_by_id(self, async_client):
        """Test that a lawyer can get a document by ID."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # First upload a document
        upload_response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("preview_test.pdf", b"preview content", "application/pdf")},
            data={"tag": "preview-test"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert upload_response.status_code == 201
        doc_id = upload_response.json()["data"]["id"]
        
        # Now get the document by ID
        get_response = await async_client.get(
            f"/documents/{doc_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["success"] is True
        assert data["data"]["id"] == doc_id
        assert data["data"]["tag"] == "preview-test"
    
    async def test_get_document_content(self, async_client):
        """Test that document content endpoint returns content."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        # First upload a document
        upload_response = await async_client.post(
            "/cases/case-1/documents",
            files={"file": ("content_test.pdf", b"test content", "application/pdf")},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert upload_response.status_code == 201
        doc_id = upload_response.json()["data"]["id"]
        
        # Now get the document content
        get_response = await async_client.get(
            f"/documents/{doc_id}/content",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert get_response.status_code == 200
        # Content should be returned (mock content in development)
        assert len(get_response.content) > 0
    
    async def test_document_not_found(self, async_client):
        """Test that getting a non-existent document returns 404."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})
        
        response = await async_client.get(
            "/documents/nonexistent-doc-id",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 404


