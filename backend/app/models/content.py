"""SQLAlchemy ORM models for public content entities."""

from sqlalchemy import String, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LawyerProfile(Base):
    """Lawyer profile model for public display."""

    __tablename__ = "lawyer_profiles"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    credentials: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    practice_areas: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    years_experience: Mapped[int] = mapped_column(Integer, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False, default="")
    firm_name: Mapped[str] = mapped_column(String(255), nullable=True)

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "bio": self.bio,
            "photoUrl": self.photo_url,
            "credentials": self.credentials,
            "practiceAreas": self.practice_areas,
            "yearsExperience": self.years_experience,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "firmName": self.firm_name,
        }


class Service(Base):
    """Service model for law firm offerings."""

    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(100), nullable=False)
    features: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "icon": self.icon,
            "features": self.features,
        }


class Testimonial(Base):
    """Testimonial model for client reviews."""

    __tablename__ = "testimonials"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "clientName": self.client_name,
            "clientTitle": self.client_title,
            "content": self.content,
            "rating": self.rating,
            "avatarUrl": self.avatar_url,
        }


class FAQ(Base):
    """FAQ model for frequently asked questions."""

    __tablename__ = "faqs"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "category": self.category,
            "question": self.question,
            "answer": self.answer,
        }
