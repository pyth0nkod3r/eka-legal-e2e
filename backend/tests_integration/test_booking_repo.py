"""Integration tests for Booking repository operations."""

import pytest
import pytest_asyncio
from datetime import datetime, timezone

from app.models.user import User
from app.models.booking import Booking, ConsultationType
from app.schemas import BookingStatus, UserRole
from app.core.security import get_password_hash
from app.repositories import booking as booking_repo


@pytest.mark.asyncio
class TestBookingRepository:
    """Test booking repository with real database."""
    
    @pytest_asyncio.fixture
    async def booking_db(self, db_session):
        """Set up database with user, consultation types, and bookings."""
        # Create user
        user = User(
            id="booking-test-user",
            email="bookinguser@test.com",
            name="Booking Test User",
            role=UserRole.CLIENT,
            password_hash=get_password_hash("password123"),
        )
        db_session.add(user)
        
        # Create consultation types
        consultation_types = [
            ConsultationType(
                id="consult-type-1",
                name="Initial Consultation",
                duration=30,
                price=0,
                description="Free consultation",
            ),
            ConsultationType(
                id="consult-type-2",
                name="Standard Consultation",
                duration=60,
                price=250,
                description="One-hour consultation",
            ),
        ]
        db_session.add_all(consultation_types)
        await db_session.flush()
        
        # Create bookings
        booking = Booking(
            id="booking-1",
            client_id="booking-test-user",
            consultation_type_id="consult-type-1",
            client_name="Booking Test User",
            client_email="bookinguser@test.com",
            date="2025-01-15",
            time="10:00",
            status=BookingStatus.PENDING,
            reason="Initial consultation request",
        )
        db_session.add(booking)
        await db_session.commit()
        
        yield db_session
    
    async def test_get_consultation_types(self, booking_db):
        """Test getting all consultation types."""
        types = await booking_repo.get_consultation_types(booking_db)
        
        assert len(types) == 2
    
    async def test_get_consultation_type_by_id(self, booking_db):
        """Test getting consultation type by ID."""
        consult = await booking_repo.get_consultation_type_by_id(booking_db, "consult-type-1")
        
        assert consult is not None
        assert consult.name == "Initial Consultation"
        assert consult.price == 0
    
    async def test_add_booking(self, booking_db):
        """Test adding a new booking."""
        booking = Booking(
            id="new-booking",
            client_id="booking-test-user",
            consultation_type_id="consult-type-2",
            client_name="Booking Test User",
            client_email="bookinguser@test.com",
            date="2025-01-20",
            time="14:00",
            status=BookingStatus.PENDING,
            reason="Need legal advice",
        )
        
        result = await booking_repo.add_booking(booking_db, booking)
        
        assert result.id == "new-booking"
        assert result.date == "2025-01-20"
    
    async def test_get_booking_by_id(self, booking_db):
        """Test getting booking by ID."""
        booking = await booking_repo.get_booking_by_id(booking_db, "booking-1")
        
        assert booking is not None
        assert booking.client_name == "Booking Test User"
    
    async def test_get_bookings_by_client(self, booking_db):
        """Test getting all bookings for a client."""
        bookings = await booking_repo.get_bookings_by_client(booking_db, "booking-test-user")
        
        assert len(bookings) == 1
    
    async def test_get_all_bookings(self, booking_db):
        """Test getting all bookings."""
        bookings = await booking_repo.get_all_bookings(booking_db)
        
        assert len(bookings) == 1
    
    async def test_update_booking_status(self, booking_db):
        """Test updating booking status."""
        updated = await booking_repo.update_booking(
            booking_db,
            "booking-1",
            status=BookingStatus.CONFIRMED
        )
        
        assert updated is not None
        assert updated.status == BookingStatus.CONFIRMED
    
    async def test_booking_to_dict(self, booking_db):
        """Test booking serialization."""
        booking = await booking_repo.get_booking_by_id(booking_db, "booking-1")
        booking_dict = booking.to_dict()
        
        assert "id" in booking_dict
        assert "clientId" in booking_dict
        assert "consultationType" in booking_dict
        assert booking_dict["status"] == "pending"
    
    async def test_booking_includes_consultation_type(self, booking_db):
        """Test that booking includes nested consultation type."""
        booking = await booking_repo.get_booking_by_id(booking_db, "booking-1")
        booking_dict = booking.to_dict()
        
        assert booking_dict["consultationType"]["name"] == "Initial Consultation"
        assert booking_dict["consultationType"]["duration"] == 30
