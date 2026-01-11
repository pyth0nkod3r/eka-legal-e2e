"""Integration tests for case document functionality.

Tests for:
- Client uploading documents to their cases
- Client downloading/previewing documents
- Document access authorization
"""

import pytest
from io import BytesIO
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestDocumentUpload:
    """Test document upload functionality."""

    async def test_client_can_upload_document_to_own_case(self, async_client):
        """Test that a client can upload a document to their own case."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        # Create a mock file
        file_content = b"Test file content for upload"
        files = {
            "file": ("test_document.pdf", BytesIO(file_content), "application/pdf")
        }

        response = await async_client.post(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "id" in data["data"]
        assert "url" in data["data"]

    async def test_client_can_upload_document_with_tag(self, async_client):
        """Test that a client can upload a document with a tag."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        file_content = b"Tagged file content"
        files = {"file": ("tagged_doc.pdf", BytesIO(file_content), "application/pdf")}
        data = {"tag": "contract"}

        response = await async_client.post(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
            data=data,
        )

        assert response.status_code == 201
        result = response.json()
        assert result["success"] is True
        assert result["data"]["tag"] == "contract"

    async def test_client_cannot_upload_to_other_client_case(self, async_client):
        """Test that a client cannot upload documents to another client's case."""
        # Create a user who doesn't own case-1
        token = create_access_token({"sub": "other-user", "email": "other@email.com"})

        file_content = b"Unauthorized upload attempt"
        files = {"file": ("hack.pdf", BytesIO(file_content), "application/pdf")}

        response = await async_client.post(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
        )

        assert response.status_code == 403

    async def test_upload_to_nonexistent_case_returns_404(self, async_client):
        """Test that uploading to a non-existent case returns 404."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}

        response = await async_client.post(
            "/cases/nonexistent-case/documents",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestDocumentRetrieval:
    """Test document retrieval/listing functionality."""

    async def test_client_can_get_documents_for_own_case(self, async_client):
        """Test that a client can retrieve documents for their own case."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # case-1 has at least one document
        assert len(data["data"]) >= 1

    async def test_document_list_includes_required_fields(self, async_client):
        """Test that document list includes all required fields."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()

        for doc in data["data"]:
            assert "id" in doc
            assert "name" in doc
            assert "type" in doc
            assert "size" in doc
            assert "uploadedAt" in doc
            assert "url" in doc

    async def test_client_cannot_get_documents_for_other_case(self, async_client):
        """Test that a client cannot retrieve documents for another client's case."""
        token = create_access_token({"sub": "other-user", "email": "other@email.com"})

        response = await async_client.get(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403


@pytest.mark.asyncio
class TestDocumentDownloadPreview:
    """Test document download and preview functionality."""

    async def test_client_can_get_document_metadata(self, async_client):
        """Test that a client can get single document metadata."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/documents/doc-1",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == "doc-1"
        assert "name" in data["data"]
        assert "type" in data["data"]

    async def test_client_can_get_document_content(self, async_client):
        """Test that a client can download/preview document content."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/documents/doc-1/content",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        # Content endpoint returns actual content, not JSON
        assert len(response.content) > 0

    async def test_client_cannot_download_other_client_document(self, async_client):
        """Test that a client cannot download another client's documents."""
        token = create_access_token({"sub": "other-user", "email": "other@email.com"})

        response = await async_client.get(
            "/documents/doc-1/content",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404  # Returns 404 for security

    async def test_download_nonexistent_document_returns_404(self, async_client):
        """Test that downloading a non-existent document returns 404."""
        token = create_access_token({"sub": "user-1", "email": "john.doe@email.com"})

        response = await async_client.get(
            "/documents/nonexistent-doc/content",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404


@pytest.mark.asyncio
class TestLawyerDocumentAccess:
    """Test that lawyers can access client documents."""

    async def test_lawyer_can_upload_to_client_case(self, async_client):
        """Test that a lawyer can upload documents to any client's case."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        file_content = b"Lawyer uploaded document"
        files = {"file": ("lawyer_doc.pdf", BytesIO(file_content), "application/pdf")}

        response = await async_client.post(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    async def test_lawyer_can_download_client_document(self, async_client):
        """Test that a lawyer can download any client's documents."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/documents/doc-1/content",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert len(response.content) > 0

    async def test_lawyer_can_view_client_case_documents(self, async_client):
        """Test that a lawyer can view document list for any case."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/cases/case-1/documents",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
