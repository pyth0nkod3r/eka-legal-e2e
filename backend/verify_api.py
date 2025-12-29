#!/usr/bin/env python3
"""
API Verification Script

Tests all endpoints of the running Eka Legal API server to ensure they work correctly.
Run the server first with: make dev
Then run this script: python verify_api.py
"""

import sys
import httpx
from dataclasses import dataclass
from typing import Optional

# Configuration
BASE_URL = "http://localhost:8000"


@dataclass
class TestResult:
    """Result of a single test."""
    endpoint: str
    method: str
    passed: bool
    status_code: int
    message: str


class APIVerifier:
    """Verifies all API endpoints."""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.client = httpx.Client(base_url=base_url, timeout=10.0)
        self.results: list[TestResult] = []
        self.token: Optional[str] = None
        self.user_email = f"test-{id(self)}@example.com"
        self.user_password = "testpassword123"
        self.booking_id: Optional[str] = None
        self.case_id: Optional[str] = None
        self.conversation_id: Optional[str] = None
        self.notification_id: Optional[str] = None
        self.document_id: Optional[str] = None
    
    def log_result(self, endpoint: str, method: str, passed: bool, status_code: int, message: str = ""):
        """Log a test result."""
        result = TestResult(endpoint, method, passed, status_code, message)
        self.results.append(result)
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status} [{method}] {endpoint} ({status_code}) {message}")
    
    def get_auth_headers(self) -> dict:
        """Get authorization headers if token is available."""
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    def run_all_tests(self) -> bool:
        """Run all API tests."""
        print("\n" + "=" * 60)
        print("🔍 EKA LEGAL API VERIFICATION")
        print("=" * 60)
        
        # Test server connectivity
        print("\n📡 Testing Server Connectivity...")
        if not self.test_server_connectivity():
            print("\n❌ Server is not reachable. Make sure the server is running.")
            print("   Start the server with: make dev")
            return False
        
        # Run test groups
        print("\n🏠 Testing Root Endpoints...")
        self.test_root_endpoints()
        
        print("\n📢 Testing Public Endpoints...")
        self.test_public_endpoints()
        
        print("\n🔑 Testing Authentication...")
        self.test_authentication()
        
        print("\n📅 Testing Booking Endpoints...")
        self.test_booking_endpoints()
        
        print("\n📁 Testing Cases Endpoints...")
        self.test_cases_endpoints()
        
        print("\n💬 Testing Messages Endpoints...")
        self.test_messages_endpoints()
        
        print("\n🔔 Testing Notifications Endpoints...")
        self.test_notifications_endpoints()
        
        print("\n📊 Testing Dashboard Endpoints...")
        self.test_dashboard_endpoints()
        
        print("\n📝 Testing Intake Endpoints...")
        self.test_intake_endpoints()
        
        # Summary
        return self.print_summary()
    
    def test_server_connectivity(self) -> bool:
        """Test if the server is reachable."""
        try:
            resp = self.client.get("/health")
            if resp.status_code == 200:
                self.log_result("/health", "GET", True, resp.status_code, "Server is healthy")
                return True
        except httpx.ConnectError:
            self.log_result("/health", "GET", False, 0, "Connection refused")
        except Exception as e:
            self.log_result("/health", "GET", False, 0, str(e))
        return False
    
    def test_root_endpoints(self):
        """Test root and health endpoints."""
        # Root endpoint
        resp = self.client.get("/")
        passed = resp.status_code == 200 and "name" in resp.json()
        self.log_result("/", "GET", passed, resp.status_code)
    
    def test_public_endpoints(self):
        """Test public content endpoints."""
        endpoints = [
            ("/public/lawyer-profile", "GET"),
            ("/public/services", "GET"),
            ("/public/testimonials", "GET"),
            ("/public/faqs", "GET"),
        ]
        
        for endpoint, method in endpoints:
            resp = self.client.get(endpoint)
            data = resp.json()
            passed = resp.status_code == 200 and data.get("success") is True
            self.log_result(endpoint, method, passed, resp.status_code)
        
        # Test contact form
        resp = self.client.post("/public/contact", json={
            "name": "Test User",
            "email": "test@example.com",
            "phone": "123-456-7890",
            "message": "Test message"
        })
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/public/contact", "POST", passed, resp.status_code)
    
    def test_authentication(self):
        """Test authentication endpoints."""
        # Test registration
        resp = self.client.post("/auth/register", json={
            "name": "Test User",
            "email": self.user_email,
            "password": self.user_password,
            "phone": "123-456-7890"
        })
        data = resp.json()
        passed = resp.status_code == 201 and data.get("success") is True
        self.log_result("/auth/register", "POST", passed, resp.status_code)
        
        if passed and data.get("data", {}).get("token"):
            self.token = data["data"]["token"]
        
        # Test login
        resp = self.client.post("/auth/login", json={
            "email": self.user_email,
            "password": self.user_password
        })
        data = resp.json()
        passed = resp.status_code == 200 and data.get("success") is True
        self.log_result("/auth/login", "POST", passed, resp.status_code)
        
        if passed and data.get("data", {}).get("token"):
            self.token = data["data"]["token"]
        
        # Test login with wrong password
        resp = self.client.post("/auth/login", json={
            "email": self.user_email,
            "password": "wrongpassword123"
        })
        data = resp.json()
        passed = resp.status_code == 200 and data.get("success") is False
        self.log_result("/auth/login (wrong password)", "POST", passed, resp.status_code)
        
        # Test get current user
        resp = self.client.get("/auth/me", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/auth/me", "GET", passed, resp.status_code)
        
        # Test forgot password
        resp = self.client.post("/auth/forgot-password", json={
            "email": self.user_email
        })
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/auth/forgot-password", "POST", passed, resp.status_code)
        
        # Test reset password
        resp = self.client.post("/auth/reset-password", json={
            "token": "fake-token",
            "password": "newpassword123"
        })
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/auth/reset-password", "POST", passed, resp.status_code)
        
        # Test logout
        resp = self.client.post("/auth/logout", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/auth/logout", "POST", passed, resp.status_code)
    
    def test_booking_endpoints(self):
        """Test booking endpoints."""
        # Get consultation types (public)
        resp = self.client.get("/booking/consultation-types")
        data = resp.json()
        passed = resp.status_code == 200 and data.get("success") is True
        self.log_result("/booking/consultation-types", "GET", passed, resp.status_code)
        
        consultation_types = data.get("data", [])
        consult_type_id = consultation_types[0]["id"] if consultation_types else "consult-1"
        
        # Get available slots
        resp = self.client.get("/booking/available-slots", params={"date": "2025-01-15"})
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/booking/available-slots", "GET", passed, resp.status_code)
        
        # Create booking (with auth)
        resp = self.client.post("/booking/bookings", json={
            "consultationTypeId": consult_type_id,
            "date": "2025-01-15",
            "time": "10:00",
            "name": "Test User",
            "email": self.user_email,
            "reason": "Test consultation"
        }, headers=self.get_auth_headers())
        data = resp.json()
        passed = resp.status_code == 201 and data.get("success") is True
        self.log_result("/booking/bookings", "POST", passed, resp.status_code)
        
        if passed:
            self.booking_id = data.get("data", {}).get("id")
        
        # Get my bookings
        resp = self.client.get("/booking/bookings", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/booking/bookings", "GET", passed, resp.status_code)
        
        # Cancel booking
        if self.booking_id:
            resp = self.client.delete(f"/booking/bookings/{self.booking_id}", headers=self.get_auth_headers())
            passed = resp.status_code == 200 and resp.json().get("success") is True
            self.log_result(f"/booking/bookings/{{id}}", "DELETE", passed, resp.status_code)
    
    def test_cases_endpoints(self):
        """Test cases endpoints."""
        # Get my cases
        resp = self.client.get("/cases", headers=self.get_auth_headers())
        data = resp.json()
        passed = resp.status_code == 200 and data.get("success") is True
        self.log_result("/cases", "GET", passed, resp.status_code)
        
        cases = data.get("data", [])
        if cases:
            self.case_id = cases[0]["id"]
        
        # Get cases with status filter
        resp = self.client.get("/cases", params={"status": "active"}, headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/cases?status=active", "GET", passed, resp.status_code)
        
        # Get case by ID (if we have one from the mock data for this user)
        if self.case_id:
            resp = self.client.get(f"/cases/{self.case_id}", headers=self.get_auth_headers())
            # May return 403 if case doesn't belong to test user - that's acceptable
            passed = resp.status_code in [200, 403]
            self.log_result(f"/cases/{{id}}", "GET", passed, resp.status_code)
        else:
            # Test with non-existent case
            resp = self.client.get("/cases/nonexistent", headers=self.get_auth_headers())
            passed = resp.status_code == 404
            self.log_result("/cases/{id} (not found)", "GET", passed, resp.status_code, "Expected 404")
    
    def test_messages_endpoints(self):
        """Test messages endpoints."""
        # Get conversations
        resp = self.client.get("/messages/conversations", headers=self.get_auth_headers())
        data = resp.json()
        passed = resp.status_code == 200 and data.get("success") is True
        self.log_result("/messages/conversations", "GET", passed, resp.status_code)
        
        conversations = data.get("data", [])
        if conversations:
            self.conversation_id = conversations[0]["id"]
        
        # Get messages for conversation (if we have one)
        if self.conversation_id:
            resp = self.client.get(
                f"/messages/conversations/{self.conversation_id}/messages",
                headers=self.get_auth_headers()
            )
            # May return 403 if user is not a participant - acceptable
            passed = resp.status_code in [200, 403]
            self.log_result(f"/messages/conversations/{{id}}/messages", "GET", passed, resp.status_code)
        
        # Test with non-existent conversation
        resp = self.client.get(
            "/messages/conversations/nonexistent/messages",
            headers=self.get_auth_headers()
        )
        passed = resp.status_code == 404
        self.log_result("/messages/conversations/{id}/messages (not found)", "GET", passed, resp.status_code, "Expected 404")
        
        # Mark messages as read
        resp = self.client.post("/messages/read", json={
            "messageIds": ["msg-1", "msg-2"]
        }, headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/messages/read", "POST", passed, resp.status_code)
    
    def test_notifications_endpoints(self):
        """Test notifications endpoints."""
        # Get notifications
        resp = self.client.get("/notifications", headers=self.get_auth_headers())
        data = resp.json()
        passed = resp.status_code == 200 and data.get("success") is True
        self.log_result("/notifications", "GET", passed, resp.status_code)
        
        notifications = data.get("data", [])
        if notifications:
            self.notification_id = notifications[0]["id"]
        
        # Mark notification as read
        if self.notification_id:
            resp = self.client.post(
                f"/notifications/{self.notification_id}/read",
                headers=self.get_auth_headers()
            )
            passed = resp.status_code in [200, 404]  # 404 if not found for this user
            self.log_result(f"/notifications/{{id}}/read", "POST", passed, resp.status_code)
        
        # Mark all as read
        resp = self.client.post("/notifications/read-all", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/notifications/read-all", "POST", passed, resp.status_code)
    
    def test_dashboard_endpoints(self):
        """Test dashboard endpoints."""
        # Get client stats
        resp = self.client.get("/dashboard/client/stats", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/dashboard/client/stats", "GET", passed, resp.status_code)
        
        # Get lawyer stats (returns client stats for non-lawyers)
        resp = self.client.get("/dashboard/lawyer/stats", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/dashboard/lawyer/stats", "GET", passed, resp.status_code)
    
    def test_intake_endpoints(self):
        """Test intake form endpoints."""
        intake_data = {
            "personalInfo": {
                "name": "Test User",
                "email": self.user_email,
                "phone": "123-456-7890",
                "preferredContact": "email"
            },
            "caseType": "family",
            "urgency": "normal",
            "description": "Test case description",
            "additionalInfo": {
                "desiredOutcome": "Resolution",
                "priorCounsel": "No"
            },
            "consent": True
        }
        
        # Submit intake form
        resp = self.client.post("/intake", json=intake_data)
        data = resp.json()
        passed = resp.status_code == 201 and data.get("success") is True
        self.log_result("/intake", "POST", passed, resp.status_code)
        
        # Get intake draft
        resp = self.client.get("/intake/draft", headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/intake/draft", "GET", passed, resp.status_code)
        
        # Save intake draft
        resp = self.client.post("/intake/draft", json=intake_data, headers=self.get_auth_headers())
        passed = resp.status_code == 200 and resp.json().get("success") is True
        self.log_result("/intake/draft", "POST", passed, resp.status_code)
    
    def print_summary(self) -> bool:
        """Print test summary and return success status."""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        
        print(f"\n  Total:  {total}")
        print(f"  Passed: {passed} ✅")
        print(f"  Failed: {failed} ❌")
        print(f"  Rate:   {(passed/total)*100:.1f}%")
        
        if failed > 0:
            print("\n❌ Failed Tests:")
            for r in self.results:
                if not r.passed:
                    print(f"   - [{r.method}] {r.endpoint} ({r.status_code}) {r.message}")
        
        print("\n" + "=" * 60)
        
        if failed == 0:
            print("✅ All tests passed! API is working correctly.")
        else:
            print(f"⚠️  {failed} test(s) failed. Please review the issues above.")
        
        print("=" * 60 + "\n")
        
        return failed == 0
    
    def close(self):
        """Close the HTTP client."""
        self.client.close()


def main():
    """Main entry point."""
    # Allow custom base URL
    base_url = sys.argv[1] if len(sys.argv) > 1 else BASE_URL
    
    verifier = APIVerifier(base_url)
    try:
        success = verifier.run_all_tests()
        sys.exit(0 if success else 1)
    finally:
        verifier.close()


if __name__ == "__main__":
    main()
