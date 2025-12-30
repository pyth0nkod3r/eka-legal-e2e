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

# Keep imports from mock database for backward compatibility during transition
from app.models.mock_database import (
    USERS,
    CASES,
    BOOKINGS,
    CONVERSATIONS,
    MESSAGES,
    NOTIFICATIONS,
    CONSULTATION_TYPES,
    LAWYER_PROFILE,
    SERVICES,
    TESTIMONIALS,
    FAQS,
    INTAKE_DRAFTS,
    CLIENT_DASHBOARD_STATS,
    LAWYER_DASHBOARD_STATS,
    get_user_by_email,
    get_user_by_id,
    add_user,
    get_cases_by_client,
    get_cases_by_status,
    get_bookings_by_client,
    get_notifications_by_user,
    get_all_users,
    get_clients,
    get_all_cases,
    get_all_bookings,
    add_case,
    add_booking,
    get_time_slots,
)

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
    # Mock database (for backward compatibility)
    "USERS",
    "CASES",
    "BOOKINGS",
    "CONVERSATIONS",
    "MESSAGES",
    "NOTIFICATIONS",
    "CONSULTATION_TYPES",
    "LAWYER_PROFILE",
    "SERVICES",
    "TESTIMONIALS",
    "FAQS",
    "INTAKE_DRAFTS",
    "CLIENT_DASHBOARD_STATS",
    "LAWYER_DASHBOARD_STATS",
    "get_user_by_email",
    "get_user_by_id",
    "add_user",
    "get_cases_by_client",
    "get_cases_by_status",
    "get_bookings_by_client",
    "get_notifications_by_user",
    "get_all_users",
    "get_clients",
    "get_all_cases",
    "get_all_bookings",
    "add_case",
    "add_booking",
    "get_time_slots",
]
