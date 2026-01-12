import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
class TestDashboardStats:
    """Test dashboard stats endpoint for trend data."""

    async def test_lawyer_stats_includes_monthly_cases_and_full_week(
        self, async_client
    ):
        """Test that lawyer dashboard stats include monthlyCases and full week appointments."""
        token = create_access_token({"sub": "lawyer-1", "email": "uti@eka-legal.com"})

        response = await async_client.get(
            "/dashboard/lawyer/stats", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        stats = data["data"]

        # Check for monthlyCases (Active Cases Trend)
        assert "monthlyCases" in stats
        assert isinstance(stats["monthlyCases"], list)
        # Should have at least some months (e.g. 6)
        # assert len(stats["monthlyCases"]) == 6

        # Check appointmentsThisWeek includes Sat and Sun
        assert "appointmentsThisWeek" in stats
        assert len(stats["appointmentsThisWeek"]) == 7
        days = [d["day"] for d in stats["appointmentsThisWeek"]]
        assert "Sat" in days
        assert "Sun" in days
