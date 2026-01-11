import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_avatar_upload_and_persistence(
    async_client: AsyncClient, user_token: str
):
    """Test uploading an avatar and ensuring it persists."""
    headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Get current profile -> avatar should be default or None
    response = await async_client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    # We don't strictly assert it's None, just get the current state

    # 2. Upload avatar
    # Create a dummy image file
    file_content = b"fakeimagecontent"
    files = {"file": ("avatar.jpg", file_content, "image/jpeg")}

    response = await async_client.post("/auth/me/avatar", headers=headers, files=files)
    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    new_avatar_url = result["data"]["avatarUrl"]
    assert new_avatar_url is not None
    assert "/static/avatars/" in new_avatar_url

    # 3. Verify persistence
    response = await async_client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["avatarUrl"] == new_avatar_url
