"""Eka Legal API - FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Mount React Frontend Static Files (if available)
# In Docker, we map the build output to /app/static
# Note: We use /app/static for the directory path in the container
# but we DO NOT mount it to /static URL because that is used for uploads.
frontend_dist = Path("/app/static")

if (frontend_dist / "assets").exists():
    # Mount /assets to serve JS/CSS/etc from the build
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")


@app.get("/")
async def serve_index():
    """Serve the React application."""
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "message": "Frontend not explicitly found (running in API-only mode?)",
    }


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve React App for any other route (SPA client-side routing)."""
    # 1. API routes are handled by routers included above.
    #    However, if a specific API route is NOT found, it might fall through here
    #    if the routers don't catch 404s properly?
    #    FastAPI routers match first. If no route matches in routers, it comes here.
    #    So we must manually return 404 for API-like paths.
    if full_path.startswith("api/") or full_path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Not Found")

    # 2. Check if a static file exists in the build root (e.g. favicon.ico, robots.txt)
    potential_file = frontend_dist / full_path
    if potential_file.is_file():
        return FileResponse(potential_file)

    # 3. Fallback to index.html for client-side routing
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Not Found")
