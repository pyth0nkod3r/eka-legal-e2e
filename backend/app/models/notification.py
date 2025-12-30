"""SQLAlchemy ORM model for Notification entity."""

from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.schemas import NotificationType


class Notification(Base):
    """Notification model for user notifications."""
    
    __tablename__ = "notifications"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(SQLEnum(NotificationType), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "type": self.type.value if isinstance(self.type, NotificationType) else self.type,
            "title": self.title,
            "message": self.message,
            "read": self.read,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "link": self.link,
        }
