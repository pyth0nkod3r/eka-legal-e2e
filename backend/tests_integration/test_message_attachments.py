import pytest
import io
from httpx import AsyncClient


@pytest.mark.asyncio
class TestMessageAttachments:
    """Integration tests for message attachment functionality."""

    async def test_upload_attachment_successful(
        self, async_client: AsyncClient, user_token: str
    ):
        """Test successful file upload with content."""
        # Create a dummy PDF file
        file_content = b"%PDF-1.4 content"
        file = io.BytesIO(file_content)
        file.name = "test.pdf"

        response = await async_client.post(
            "/messages/conversations/conv-1/upload",
            headers={"Authorization": f"Bearer {user_token}"},
            files={"file": ("test.pdf", file, "application/pdf")},
            data={"content": "Here is the document"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

        message = data["data"]
        assert message["content"] == "Here is the document"
        assert "attachments" in message
        assert len(message["attachments"]) == 1

        attachment = message["attachments"][0]
        assert attachment["filename"] == "test.pdf"
        assert attachment["fileType"] == "application/pdf"
        assert attachment["fileSize"] == len(file_content)
        assert attachment["url"].startswith("/static/")
        assert "/messages/" in attachment["url"]

    async def test_upload_attachment_no_content_fallback(
        self, async_client: AsyncClient, user_token: str
    ):
        """Test upload without explicit content uses fallback text."""
        file_content = b"image content"
        file = io.BytesIO(file_content)
        file.name = "image.png"

        response = await async_client.post(
            "/messages/conversations/conv-1/upload",
            headers={"Authorization": f"Bearer {user_token}"},
            files={"file": ("image.png", file, "image/png")},
            data={"content": ""},
        )

        assert response.status_code == 201
        data = response.json()
        message = data["data"]
        assert message["content"].startswith("Sent an attachment:")
        assert message["content"].endswith("image.png")
        assert len(message["attachments"]) == 1

    async def test_upload_requires_auth(self, async_client: AsyncClient):
        """Test upload requires authentication."""
        file = io.BytesIO(b"content")
        file.name = "test.txt"

        response = await async_client.post(
            "/messages/conversations/conv-1/upload",
            files={"file": ("test.txt", file, "text/plain")},
        )
        assert response.status_code == 401

    async def test_upload_requires_participant(
        self, async_client: AsyncClient, admin_token: str
    ):
        """Test that non-participants cannot upload to a conversation."""
        # admin-1 is not in conv-1 (participants are user-1 and lawyer-1)
        file = io.BytesIO(b"content")
        file.name = "test.txt"

        response = await async_client.post(
            "/messages/conversations/conv-1/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.txt", file, "text/plain")},
        )
        assert response.status_code == 403

    async def test_upload_file_required(
        self, async_client: AsyncClient, user_token: str
    ):
        """Test validation for missing file."""
        response = await async_client.post(
            "/messages/conversations/conv-1/upload",
            headers={"Authorization": f"Bearer {user_token}"},
            data={"content": "Forgot the file"},
        )
        assert response.status_code == 422  # FastAPI default validation error
