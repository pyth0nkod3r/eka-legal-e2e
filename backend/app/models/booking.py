"""SQLAlchemy ORM models for Booking and ConsultationType entities."""

from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Integer, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.schemas import BookingStatus


class ConsultationType(Base):
    """Consultation type model for booking options."""
    
    __tablename__ = "consultation_types"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # in minutes
    price: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Relationships
    bookings = relationship("Booking", back_populates="consultation_type")
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "name": self.name,
            "duration": self.duration,
            "price": self.price,
            "description": self.description,
        }


class Booking(Base):
    """Booking model for consultation appointments."""
    
    __tablename__ = "bookings"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id"), nullable=True, index=True)
    consultation_type_id: Mapped[str] = mapped_column(String(50), ForeignKey("consultation_types.id"), nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_email: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD format
    time: Mapped[str] = mapped_column(String(10), nullable=False)  # HH:MM format
    status: Mapped[str] = mapped_column(SQLEnum(BookingStatus), nullable=False, default=BookingStatus.PENDING)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    
    # Relationships
    client = relationship("User", back_populates="bookings")
    consultation_type = relationship("ConsultationType", back_populates="bookings", lazy="joined")
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "clientId": self.client_id,
            "clientName": self.client_name,
            "clientEmail": self.client_email,
            "consultationType": self.consultation_type.to_dict() if self.consultation_type else None,
            "date": self.date,
            "time": self.time,
            "status": self.status.value if isinstance(self.status, BookingStatus) else self.status,
            "reason": self.reason,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
