import pytest
from httpx import AsyncClient
from app.models.user import User
from app.schemas import UserRole, ClientStatus
from app.repositories import user as user_repo


@pytest.mark.asyncio
async def test_search_clients_starts_with(
    async_client: AsyncClient, db_session, admin_token
):
    """Test client search uses 'starts with' logic."""

    # 1. Create test clients
    # Client that starts with "Ali"
    alice = User(
        id="user-search-1",
        email="alice@example.com",
        name="Alice Wonderland",
        role=UserRole.CLIENT,
        status=ClientStatus.ACTIVE,
        password_hash="hash",
    )

    # Client that has "Ali" but doesn't start with it
    mailman = User(
        id="user-search-2",
        email="malibu@example.com",
        name="Malibu Aligator",
        role=UserRole.CLIENT,
        status=ClientStatus.ACTIVE,
        password_hash="hash",
    )

    # Client completely different
    bob = User(
        id="user-search-3",
        email="bob@example.com",
        name="Bob Builder",
        role=UserRole.CLIENT,
        status=ClientStatus.ACTIVE,
        password_hash="hash",
    )

    await user_repo.add_user(db_session, alice)
    await user_repo.add_user(db_session, mailman)
    await user_repo.add_user(db_session, bob)

    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Search for "Ali" - Should match Alice, SHOULD NOT match Malibu (if starts_with is enforced)
    # The current implementation uses 'in' (contains), so currently this test might fail or pass depending on assertion logic.
    # We want to assertion that it ONLY returns Alice.

    response = await async_client.get("/clients/search?q=Ali", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    names = [u["name"] for u in data["data"]]

    assert "Alice Wonderland" in names
    # This assertion will FAIL if logic is 'contains' instead of 'startswith'
    assert "Malibu Aligator" not in names

    # 3. Search for "a" - Should match Alice (Alice starts with A)
    response_a = await async_client.get("/clients/search?q=a", headers=headers)
    assert response_a.status_code == 200
    names_a = [u["name"] for u in response_a.json()["data"]]
    assert "Alice Wonderland" in names_a
    # Bob does not start with A
    assert "Bob Builder" not in names_a
