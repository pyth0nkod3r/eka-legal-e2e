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
            id="test-user-1",
            email="testuser@test.com",
            name="Test User",
            role=UserRole.CLIENT,
            phone="+1234567890",
            password_hash=get_password_hash("testpassword123"),
        ),
        User(
            id="test-lawyer-1",
            email="testlawyer@test.com",
            name="Test Lawyer",
            role=UserRole.LAWYER,
            phone="+0987654321",
            password_hash=get_password_hash("testpassword123"),
        ),
        User(
            id="test-admin-1",
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
    """Create async HTTP client with test database."""
    # Create session factory for test DB
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
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
        transport=ASGITransport(app=app),
        base_url="http://testserver/api/v1"
    ) as client:
        yield client
    
    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture
def user_token():
    """Create a JWT token for the test user."""
    return create_access_token(data={"sub": "test-user-1", "email": "testuser@test.com"})


@pytest.fixture
def lawyer_token():
    """Create a JWT token for the test lawyer."""
    return create_access_token(data={"sub": "test-lawyer-1", "email": "testlawyer@test.com"})


@pytest.fixture
def admin_token():
    """Create a JWT token for the test admin."""
    return create_access_token(data={"sub": "test-admin-1", "email": "testadmin@test.com"})


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
