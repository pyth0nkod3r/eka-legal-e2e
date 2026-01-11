"""Repository layer for database operations."""

from app.repositories.user import (
    get_user_by_email,
    get_user_by_id,
    add_user,
    get_all_users,
    get_clients,
    update_user,
)

from app.repositories.case import (
    get_cases_by_client,
    get_all_cases,
    get_case_by_id,
    get_cases_by_status,
    add_case,
    add_document,
    add_timeline_event,
    update_case,
    delete_document,
)

from app.repositories.booking import (
    get_consultation_types,
    get_consultation_type_by_id,
    get_bookings_by_client,
    get_all_bookings,
    get_booking_by_id,
    add_booking,
    add_consultation_type,
    update_booking,
)

from app.repositories.messaging import (
    get_conversations_by_user,
    get_all_conversations,
    get_conversation_by_id,
    get_messages_by_conversation,
    add_conversation,
    add_message,
    add_participant,
    mark_messages_read,
    update_conversation_last_message,
)

from app.repositories.notification import (
    get_notifications_by_user,
    add_notification,
    mark_notification_read,
    mark_all_notifications_read,
)

from app.repositories.content import (
    get_lawyer_profile,
    get_all_services,
    get_service_by_id,
    get_all_testimonials,
    get_all_faqs,
    add_lawyer_profile,
    add_service,
    add_testimonial,
    add_faq,
)

__all__ = [
    # User
    "get_user_by_email",
    "get_user_by_id",
    "add_user",
    "get_all_users",
    "get_clients",
    "update_user",
    # Case
    "get_cases_by_client",
    "get_all_cases",
    "get_case_by_id",
    "get_cases_by_status",
    "add_case",
    "add_document",
    "add_timeline_event",
    "update_case",
    "delete_document",
    # Booking
    "get_consultation_types",
    "get_consultation_type_by_id",
    "get_bookings_by_client",
    "get_all_bookings",
    "get_booking_by_id",
    "add_booking",
    "add_consultation_type",
    "update_booking",
    # Messaging
    "get_conversations_by_user",
    "get_all_conversations",
    "get_conversation_by_id",
    "get_messages_by_conversation",
    "add_conversation",
    "add_message",
    "add_participant",
    "mark_messages_read",
    "update_conversation_last_message",
    # Notification
    "get_notifications_by_user",
    "add_notification",
    "mark_notification_read",
    "mark_all_notifications_read",
    # Content
    "get_lawyer_profile",
    "get_all_services",
    "get_service_by_id",
    "get_all_testimonials",
    "get_all_faqs",
    "add_lawyer_profile",
    "add_service",
    "add_testimonial",
    "add_faq",
]
