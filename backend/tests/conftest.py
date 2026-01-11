"""Pytest configuration."""

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models.user import User
from app.schemas import UserRole


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


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
async def db_session(db_engine):
    """Create a test database session."""
    session_factory = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_factory() as session:
        # Seed data
        user = User(
            id="user-1",
            email="john.doe@email.com",
            name="John Doe",
            role=UserRole.CLIENT,
            phone="1234567890",
            password_hash=get_password_hash("password123"),
        )
        lawyer = User(
            id="lawyer-1",
            email="uti@eka-legal.com",
            name="Eka Utibe",
            role=UserRole.LAWYER,
            phone="0987654321",
            password_hash=get_password_hash("password123"),
        )
        session.add(user)
        session.add(lawyer)

        # Seed additional data for other tests
        from app.models.case import Case
        from app.models.booking import Booking, ConsultationType
        from app.models.messaging import Conversation, ConversationParticipant, Message
        from app.models.content import LawyerProfile, Service, FAQ
        from app.schemas import CaseStatus, BookingStatus, NotificationType
        from datetime import datetime, timezone

        # Lawyer Profile
        profile = LawyerProfile(
            id="lawyer-1",
            name="Eka Utibe, Esq.",
            title="Principal Attorney",
            bio="Experienced lawyer.",
            email="uti@eka-legal.com",
            phone="0987654321",
            photo_url="/lawyer.jpg",
            credentials=["JD", "LLM"],
            practice_areas=["Corporate"],
            years_experience=15,
        )
        session.add(profile)

        # Services
        service = Service(
            id="service-1",
            title="General Counsel",
            description="General legal advice",
            icon="Scale",
        )
        session.add(service)

        # FAQ
        faq = FAQ(
            id="faq-1",
            category="General",
            question="What is the cost?",
            answer="It depends.",
        )
        session.add(faq)

        # Consultation Types
        consult_types = [
            ConsultationType(
                id="consult-1",
                name="Initial Consultation",
                duration=30,
                price=100.0,
                description="First meeting",
            ),
            ConsultationType(
                id="consult-2",
                name="Standard Consultation",
                duration=60,
                price=200.0,
                description="Standard meeting",
            ),
            ConsultationType(
                id="consult-3",
                name="Premium Consultation",
                duration=90,
                price=300.0,
                description="Premium meeting",
            ),
        ]
        session.add_all(consult_types)

        # Cases
        case1 = Case(
            id="case-1",
            client_id="user-1",
            title="Business Contract Review",
            description="A test case",
            status=CaseStatus.ACTIVE,
            case_type="Civil",
        )
        case2 = Case(
            id="case-2",
            client_id="user-1",
            title="Estate Planning",
            description="Another test case",
            status=CaseStatus.PENDING,
            case_type="Family",
        )
        session.add(case1)
        session.add(case2)

        # Bookings
        booking = Booking(
            id="booking-1",
            client_id="user-1",
            consultation_type_id="consult-1",
            client_name="John Doe",
            client_email="john.doe@email.com",
            date="2025-01-01",
            time="10:00",
            status=BookingStatus.CONFIRMED,
            reason="Legal help",
        )
        session.add(booking)

        # Conversations
        conv = Conversation(
            id="conv-1",
            case_id="case-1",
            last_message="Hello",
            last_message_at=datetime.now(timezone.utc),
            unread_count=1,
        )
        session.add(conv)
        await session.flush()

        p1 = ConversationParticipant(
            conversation_id="conv-1", user_id="user-1", name="John Doe", role="client"
        )
        p2 = ConversationParticipant(
            conversation_id="conv-1",
            user_id="lawyer-1",
            name="Eka Utibe",
            role="lawyer",
        )
        session.add_all([p1, p2])

        msg = Message(
            id="msg-1",
            conversation_id="conv-1",
            sender_id="lawyer-1",
            sender_name="Eka Utibe",
            sender_role=UserRole.LAWYER,
            content="Hello",
            read=False,
        )
        session.add(msg)

        # Notifications
        from app.models.notification import Notification

        notif = Notification(
            id="notif-1",
            user_id="user-1",
            title="Test Notification",
            message="This is a test notification",
            type=NotificationType.SYSTEM,
            read=False,
            created_at=datetime.now(timezone.utc),
        )
        session.add(notif)

        await session.commit()

        yield session


@pytest.fixture
def client(db_session):
    """Create test client with overridden database."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app, base_url="http://testserver/api/v1") as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    """Create authentication headers for test user."""
    token = create_access_token(data={"sub": "user-1", "email": "john.doe@email.com"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lawyer_auth_headers():
    """Create authentication headers for lawyer user."""
    token = create_access_token(data={"sub": "lawyer-1", "email": "uti@eka-legal.com"})
    return {"Authorization": f"Bearer {token}"}
