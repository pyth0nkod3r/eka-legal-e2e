"""SQLAlchemy ORM models package."""

# Import Base for other modules to use
from app.core.database import Base

# Import all models to ensure they are registered with Base
from app.models.user import User
from app.models.case import Case, Document, TimelineEvent
from app.models.booking import ConsultationType, Booking
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.models.notification import Notification
from app.models.content import LawyerProfile, Service, Testimonial, FAQ

__all__ = [
    # Base
    "Base",
    # ORM Models
    "User",
    "Case",
    "Document",
    "TimelineEvent",
    "ConsultationType",
    "Booking",
    "Conversation",
    "ConversationParticipant",
    "Message",
    "Notification",
    "LawyerProfile",
    "Service",
    "Testimonial",
    "FAQ",
]
