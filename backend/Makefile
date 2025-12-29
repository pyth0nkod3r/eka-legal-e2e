.PHONY: install dev run test test-cov lint format clean verify help

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install/sync dependencies"
	@echo "  make dev        - Run development server with hot reload"
	@echo "  make run        - Run production server"
	@echo "  make test       - Run tests"
	@echo "  make test-cov   - Run tests with coverage"
	@echo "  make lint       - Run linter (ruff)"
	@echo "  make format     - Format code (ruff)"
	@echo "  make verify     - Verify API endpoints (server must be running)"
	@echo "  make clean      - Remove cache files"
	@echo "  make help       - Show this help message"

# Install dependencies
install:
	uv sync

# Run development server with hot reload
dev:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run production server
run:
	uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run tests
test:
	uv run pytest

# Run tests with coverage
test-cov:
	uv run pytest --cov=app --cov-report=term-missing

# Run linter
lint:
	uv run ruff check .

# Format code
format:
	uv run ruff format .

# Verify API endpoints (server must be running)
verify:
	uv run python verify_api.py

# Clean cache files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
