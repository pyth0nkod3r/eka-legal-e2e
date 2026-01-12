"""Eka Legal API - FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.seed import seed_database
from app.routers import (
    auth_router,
    public_router,
    booking_router,
    cases_router,
    documents_router,
    messages_router,
    notifications_router,
    dashboard_router,
    intake_router,
    clients_router,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    # Startup: Initialize database and seed initial data
    await init_db()
    await seed_database()
    yield
    # Shutdown: Close database connections
    await close_db()


app = FastAPI(
    title=settings.app_name,
    description="Backend API for Eka Legal Consultancy practice management system.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Ensure uploads directory exists
Path("uploads").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api/v1 prefix
API_V1_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(public_router, prefix=API_V1_PREFIX)
app.include_router(booking_router, prefix=API_V1_PREFIX)
app.include_router(cases_router, prefix=API_V1_PREFIX)
app.include_router(documents_router, prefix=API_V1_PREFIX)
app.include_router(messages_router, prefix=API_V1_PREFIX)
app.include_router(notifications_router, prefix=API_V1_PREFIX)
app.include_router(dashboard_router, prefix=API_V1_PREFIX)
app.include_router(intake_router, prefix=API_V1_PREFIX)
app.include_router(clients_router, prefix=API_V1_PREFIX)


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
