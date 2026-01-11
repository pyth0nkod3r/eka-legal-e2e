import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_update_firm_settings(async_client: AsyncClient, admin_headers: dict):
    """Test updating firm settings (lawyer profile)."""

    # 1. Get current profile
    response = await async_client.get("/public/lawyer-profile")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["success"] is True

    # 2. Update profile with new address and phone
    update_data = {
        "address": "123 Legal St, Law City",
        "phone": "+19998887777",
        "email": "firm@eka-legal.com",
        "firmName": "Eka Legal Consultancy",  # This might be mapped to 'name' or separate
    }

    # Currently determining endpoint - likely /public/lawyer-profile or /admin/settings
    # We will assume /public/lawyer-profile specific for profile updates
    response = await async_client.put(
        "/public/lawyer-profile", json=update_data, headers=admin_headers
    )

    # Expect success
    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert result["data"]["address"] == "123 Legal St, Law City"
    assert result["data"]["phone"] == "+19998887777"

    # 3. Verify persistence
    response = await async_client.get("/public/lawyer-profile")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["address"] == "123 Legal St, Law City"
    assert data["phone"] == "+19998887777"
