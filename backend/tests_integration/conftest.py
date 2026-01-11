"""Pytest configuration for integration tests using SQLite."""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.user import User
from app.models.booking import ConsultationType
from app.schemas import UserRole


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def seeded_db(db_session: AsyncSession):
    """Seed the test database with initial data."""
    # Create test users
    users = [
        User(
            id="user-1",
            email="john.doe@email.com",
            name="Test User",
            role=UserRole.CLIENT,
            phone="+1234567890",
            password_hash=get_password_hash("testpassword123"),
        ),
        User(
            id="lawyer-1",
            email="uti@eka-legal.com",
            name="Test Lawyer",
            role=UserRole.LAWYER,
            phone="+0987654321",
            password_hash=get_password_hash("testpassword123"),
        ),
        User(
            id="admin-1",
            email="testadmin@test.com",
            name="Test Admin",
            role=UserRole.ADMIN,
            phone="+1111111111",
            password_hash=get_password_hash("testpassword123"),
        ),
    ]
    db_session.add_all(users)

    # Create consultation types
    consultation_types = [
        ConsultationType(
            id="consult-1",
            name="Initial Consultation",
            duration=30,
            price=0,
            description="Free 30-minute consultation",
        ),
        ConsultationType(
            id="consult-2",
            name="Standard Consultation",
            duration=60,
            price=250,
            description="One-hour consultation",
        ),
    ]
    db_session.add_all(consultation_types)

    await db_session.commit()

    yield db_session


@pytest_asyncio.fixture(scope="function")
async def async_client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client with test database and seed data."""
    from app.models.booking import ConsultationType
    from app.models.content import LawyerProfile, Service
    from app.models.case import Case
    from app.schemas import CaseStatus

    # Create session factory for test DB
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Seed the database with test data
    async with async_session() as session:
        # Create test users
        users = [
            User(
                id="user-1",
                email="john.doe@email.com",
                name="Test User",
                role=UserRole.CLIENT,
                phone="+1234567890",
                password_hash=get_password_hash("testpassword123"),
            ),
            User(
                id="lawyer-1",
                email="uti@eka-legal.com",
                name="Test Lawyer",
                role=UserRole.LAWYER,
                phone="+0987654321",
                password_hash=get_password_hash("testpassword123"),
            ),
            User(
                id="admin-1",
                email="testadmin@test.com",
                name="Test Admin",
                role=UserRole.ADMIN,
                phone="+1111111111",
                password_hash=get_password_hash("testpassword123"),
            ),
        ]
        session.add_all(users)

        # Create consultation types
        consultation_types = [
            ConsultationType(
                id="consult-1",
                name="Initial Consultation",
                duration=30,
                price=0,
                description="Free 30-minute consultation",
            ),
            ConsultationType(
                id="consult-2",
                name="Standard Consultation",
                duration=60,
                price=250,
                description="One-hour consultation",
            ),
            ConsultationType(
                id="consult-3",
                name="Extended Consultation",
                duration=90,
                price=350,
                description="90-minute comprehensive session",
            ),
        ]
        session.add_all(consultation_types)

        # Create lawyer profile
        lawyer_profile = LawyerProfile(
            id="lawyer-1",
            name="Test Lawyer",
            title="Principal Attorney",
            bio="Test lawyer bio",
            photo_url="/test-lawyer.jpg",
            credentials=["J.D.", "Bar Member"],
            practice_areas=["Corporate Law", "Contract Law"],
            years_experience=10,
            email="uti@eka-legal.com",
            phone="+0987654321",
            address="555 4 Ave SW, Calgary, AB T2P 3E7, Canada",
            firm_name="Eka Legal Consultancy",
        )
        session.add(lawyer_profile)

        # Create services
        services = [
            Service(
                id="service-1",
                title="Corporate Law",
                description="Business legal support",
                icon="Building2",
                features=["Business formation", "Compliance"],
            ),
            Service(
                id="service-2",
                title="Contract Law",
                description="Contract drafting and review",
                icon="FileText",
                features=["Drafting", "Review"],
            ),
        ]
        session.add_all(services)

        # Create test cases
        from app.models.case import Document
        from datetime import datetime, timedelta

        test_case = Case(
            id="case-1",
            client_id="user-1",
            title="Test Case",
            description="Test case description",
            status=CaseStatus.ACTIVE,
            case_type="Contract Law",
        )
        session.add(test_case)

        # Add a second case for variety
        test_case_2 = Case(
            id="case-2",
            client_id="user-1",
            title="Second Test Case",
            description="Another test case",
            status=CaseStatus.PENDING,
            case_type="Corporate Law",
        )
        session.add(test_case_2)
        await session.flush()

        # Create test documents
        test_doc = Document(
            id="doc-1",
            case_id="case-1",
            name="test_document.pdf",
            type="application/pdf",
            size=12345,
            uploaded_by="Test User",
            url="/documents/doc-1/test_document.pdf",
            tag="contract",
        )
        session.add(test_doc)

        # Create bookings
        from app.models.booking import Booking
        from app.schemas import BookingStatus
        from datetime import timezone

        today = datetime.now(timezone.utc)
        booking = Booking(
            id="booking-1",
            client_id="user-1",
            consultation_type_id="consult-2",
            client_name="Test User",
            client_email="john.doe@email.com",
            date=(today + timedelta(days=2)).strftime("%Y-%m-%d"),
            time="10:00",
            status=BookingStatus.CONFIRMED,
            reason="Test consultation",
        )
        session.add(booking)

        # Create conversations and messages
        from app.models.messaging import Conversation, ConversationParticipant, Message

        conv = Conversation(
            id="conv-1",
            case_id="case-1",
            last_message="Test message",
            last_message_at=today,
            unread_count=1,
        )
        session.add(conv)
        await session.flush()

        participants = [
            ConversationParticipant(
                conversation_id="conv-1",
                user_id="user-1",
                name="Test User",
                role="client",
            ),
            ConversationParticipant(
                conversation_id="conv-1",
                user_id="lawyer-1",
                name="Test Lawyer",
                role="lawyer",
            ),
        ]
        session.add_all(participants)

        messages = [
            Message(
                id="msg-1",
                conversation_id="conv-1",
                sender_id="lawyer-1",
                sender_name="Test Lawyer",
                sender_role=UserRole.LAWYER,
                content="Hello from lawyer",
                timestamp=today - timedelta(hours=2),
                read=False,
            ),
            Message(
                id="msg-2",
                conversation_id="conv-1",
                sender_id="user-1",
                sender_name="Test User",
                sender_role=UserRole.CLIENT,
                content="Hello from client",
                timestamp=today - timedelta(hours=1),
                read=True,
            ),
        ]
        session.add_all(messages)

        await session.commit()

    async def override_get_db():
        async with async_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    # Override the dependency
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver/api/v1"
    ) as client:
        yield client

    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture
def user_token():
    """Create a JWT token for the test user."""
    return create_access_token(data={"sub": "user-1", "email": "john.doe@email.com"})


@pytest.fixture
def lawyer_token():
    """Create a JWT token for the test lawyer."""
    return create_access_token(data={"sub": "lawyer-1", "email": "uti@eka-legal.com"})


@pytest.fixture
def admin_token():
    """Create a JWT token for the test admin."""
    return create_access_token(data={"sub": "admin-1", "email": "testadmin@test.com"})


@pytest.fixture
def auth_headers(user_token):
    """Auth headers for test user."""
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def lawyer_headers(lawyer_token):
    """Auth headers for test lawyer."""
    return {"Authorization": f"Bearer {lawyer_token}"}


@pytest.fixture
def admin_headers(admin_token):
    """Auth headers for test admin."""
    return {"Authorization": f"Bearer {admin_token}"}
