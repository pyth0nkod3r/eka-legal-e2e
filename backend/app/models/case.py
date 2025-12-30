"""SQLAlchemy ORM models for Case, Document, and TimelineEvent entities."""

from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.schemas import CaseStatus, TimelineEventType


class Case(Base):
    """Case model for legal matters."""
    
    __tablename__ = "cases"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(SQLEnum(CaseStatus), nullable=False, default=CaseStatus.PENDING)
    case_type: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
    
    # Relationships
    client = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan", lazy="selectin")
    timeline = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan", lazy="selectin", order_by="TimelineEvent.date")
    conversations = relationship("Conversation", back_populates="case", lazy="selectin")
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "clientId": self.client_id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value if isinstance(self.status, CaseStatus) else self.status,
            "caseType": self.case_type,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "documents": [doc.to_dict() for doc in self.documents] if self.documents else [],
            "timeline": [event.to_dict() for event in self.timeline] if self.timeline else [],
        }


class Document(Base):
    """Document model for case attachments."""
    
    __tablename__ = "documents"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(50), ForeignKey("cases.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    uploaded_by: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    
    # Relationships
    case = relationship("Case", back_populates="documents")
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "size": self.size,
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "uploadedBy": self.uploaded_by,
            "url": self.url,
        }


class TimelineEvent(Base):
    """Timeline event model for case history."""
    
    __tablename__ = "timeline_events"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(50), ForeignKey("cases.id"), nullable=False, index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(SQLEnum(TimelineEventType), nullable=False)
    
    # Relationships
    case = relationship("Case", back_populates="timeline")
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "date": self.date.isoformat() if self.date else None,
            "title": self.title,
            "description": self.description,
            "type": self.type.value if isinstance(self.type, TimelineEventType) else self.type,
        }
