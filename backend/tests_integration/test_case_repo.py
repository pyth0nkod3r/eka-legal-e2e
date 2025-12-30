"""Integration tests for Case repository operations."""

import pytest
import pytest_asyncio
from datetime import datetime, timezone

from app.models.case import Case, Document, TimelineEvent
from app.models.user import User
from app.schemas import CaseStatus, TimelineEventType, UserRole
from app.core.security import get_password_hash
from app.repositories import case as case_repo


@pytest.mark.asyncio
class TestCaseRepository:
    """Test case repository with real database."""
    
    @pytest_asyncio.fixture
    async def case_db(self, db_session):
        """Set up database with user and cases."""
        # Create a user first
        user = User(
            id="case-test-user",
            email="caseuser@test.com",
            name="Case Test User",
            role=UserRole.CLIENT,
            password_hash=get_password_hash("password123"),
        )
        db_session.add(user)
        await db_session.flush()
        
        # Create cases
        cases = [
            Case(
                id="case-1",
                client_id="case-test-user",
                title="Test Case 1",
                description="First test case",
                status=CaseStatus.ACTIVE,
                case_type="Contract Law",
            ),
            Case(
                id="case-2",
                client_id="case-test-user",
                title="Test Case 2",
                description="Second test case",
                status=CaseStatus.PENDING,
                case_type="Estate Planning",
            ),
        ]
        db_session.add_all(cases)
        await db_session.commit()
        
        yield db_session
    
    async def test_add_case(self, case_db):
        """Test adding a new case."""
        case = Case(
            id="new-case",
            client_id="case-test-user",
            title="New Case",
            description="A new test case",
            status=CaseStatus.PENDING,
            case_type="Civil Litigation",
        )
        
        result = await case_repo.add_case(case_db, case)
        
        assert result.id == "new-case"
        assert result.title == "New Case"
    
    async def test_get_case_by_id(self, case_db):
        """Test getting case by ID."""
        case = await case_repo.get_case_by_id(case_db, "case-1")
        
        assert case is not None
        assert case.title == "Test Case 1"
        assert case.status == CaseStatus.ACTIVE
    
    async def test_get_cases_by_client(self, case_db):
        """Test getting all cases for a client."""
        cases = await case_repo.get_cases_by_client(case_db, "case-test-user")
        
        assert len(cases) == 2
    
    async def test_get_all_cases(self, case_db):
        """Test getting all cases."""
        cases = await case_repo.get_all_cases(case_db)
        
        assert len(cases) == 2
    
    async def test_get_cases_by_status(self, case_db):
        """Test filtering cases by status."""
        active_cases = await case_repo.get_cases_by_status(case_db, CaseStatus.ACTIVE)
        pending_cases = await case_repo.get_cases_by_status(case_db, CaseStatus.PENDING)
        
        assert len(active_cases) == 1
        assert len(pending_cases) == 1
    
    async def test_add_document(self, case_db):
        """Test adding a document to a case."""
        doc = Document(
            id="doc-1",
            case_id="case-1",
            name="test_document.pdf",
            type="application/pdf",
            size=12345,
            uploaded_by="Case Test User",
            url="/documents/test.pdf",
        )
        
        result = await case_repo.add_document(case_db, doc)
        
        assert result.id == "doc-1"
        assert result.name == "test_document.pdf"
    
    async def test_add_timeline_event(self, case_db):
        """Test adding a timeline event to a case."""
        event = TimelineEvent(
            id="event-1",
            case_id="case-1",
            date=datetime.now(timezone.utc),
            title="Case Created",
            description="Initial case creation",
            type=TimelineEventType.STATUS,
        )
        
        result = await case_repo.add_timeline_event(case_db, event)
        
        assert result.id == "event-1"
        assert result.title == "Case Created"
    
    async def test_update_case(self, case_db):
        """Test updating case fields."""
        updated = await case_repo.update_case(
            case_db,
            "case-1",
            status=CaseStatus.CLOSED,
            title="Updated Title"
        )
        
        assert updated is not None
        assert updated.status == CaseStatus.CLOSED
        assert updated.title == "Updated Title"
    
    async def test_case_to_dict(self, case_db):
        """Test case serialization."""
        case = await case_repo.get_case_by_id(case_db, "case-1")
        case_dict = case.to_dict()
        
        assert "id" in case_dict
        assert "clientId" in case_dict
        assert case_dict["status"] == "active"
        assert "documents" in case_dict
        assert "timeline" in case_dict
