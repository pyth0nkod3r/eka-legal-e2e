# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend ./

# Build the frontend
RUN npm run build

# Stage 2: Backend & Final
FROM python:3.12-slim

WORKDIR /app

# Install uv provided tools
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install backend dependencies
# --frozen ensures we stick to the lockfile
# --no-dev excludes development dependencies
RUN uv sync --frozen --no-dev

# Copy backend source code
COPY backend .

# Copy frontend build artifacts from builder stage
# Assuming Vite builds to 'dist' directory
COPY --from=frontend-builder /app/frontend/dist /app/static

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
