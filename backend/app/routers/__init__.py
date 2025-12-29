"""Routers module exports."""

from app.routers.auth import router as auth_router
from app.routers.public import router as public_router
from app.routers.booking import router as booking_router
from app.routers.cases import router as cases_router
from app.routers.documents import router as documents_router
from app.routers.messages import router as messages_router
from app.routers.notifications import router as notifications_router
from app.routers.dashboard import router as dashboard_router
from app.routers.intake import router as intake_router

__all__ = [
    "auth_router",
    "public_router",
    "booking_router",
    "cases_router",
    "documents_router",
    "messages_router",
    "notifications_router",
    "dashboard_router",
    "intake_router",
]
