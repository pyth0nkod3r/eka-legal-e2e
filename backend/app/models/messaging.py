"""SQLAlchemy ORM models for Messaging entities."""

from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Text,
    DateTime,
    Integer,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.schemas import UserRole


class Conversation(Base):
    """Conversation model for case-related messaging threads."""

    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    case_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("cases.id"), nullable=True, index=True
    )
    last_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_message_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    unread_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    case = relationship("Case", back_populates="conversations", lazy="selectin")
    participants = relationship(
        "ConversationParticipant",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Message.timestamp",
    )

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "caseId": self.case_id,
            "caseTitle": self.case.title if self.case else "",
            "participants": [p.to_dict() for p in self.participants]
            if self.participants
            else [],
            "lastMessage": self.last_message,
            "lastMessageAt": self.last_message_at.isoformat()
            if self.last_message_at
            else None,
            "unreadCount": self.unread_count,
        }


class ConversationParticipant(Base):
    """Participant in a conversation."""

    __tablename__ = "conversation_participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("conversations.id"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    conversation = relationship("Conversation", back_populates="participants")

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.user_id,
            "name": self.name,
            "role": self.role,
        }


class Message(Base):
    """Message model for conversation messages."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    conversation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("conversations.id"), nullable=False, index=True
    )
    sender_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("users.id"), nullable=False
    )
    sender_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sender_role: Mapped[str] = mapped_column(SQLEnum(UserRole), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "senderId": self.sender_id,
            "senderName": self.sender_name,
            "senderRole": self.sender_role.value
            if isinstance(self.sender_role, UserRole)
            else self.sender_role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "read": self.read,
        }
