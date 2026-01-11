# Eka Legal E2E

Eka Legal E2E is a full-stack application for legal consultancy management.

## Tech Stack

- **Backend**: Python (FastAPI), managed with `uv`.
- **Frontend**: TypeScript (React, Vite).
- **Database**: PostgreSQL (v17).
- **Proxy**: Nginx.
- **Containerization**: Docker Compose.

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Running with Docker

1.  **Build and start the application**:

    ```bash
    docker-compose up -d --build
    ```

    This will spin up three containers:
    - `db`: PostgreSQL database.
    - `backend`: FastAPI backend.
    - `frontend`: Nginx serving the React app.

2.  **Access the application**:

    - **Frontend**: [http://localhost:8080](http://localhost:8080)
    - **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000)
    - **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Development

- **Frontend Port**: The frontend runs on port `8080` (mapped from container port `80`) to avoid privileged port permission issues on some systems.
- **Database Persistence**: Data is persisted in a named volume `postgres_data`. `PGDATA` is configured to subdirectory `/var/lib/postgresql/data/pgdata`.

## Commands

- **Stop containers**:
    ```bash
    docker-compose down
    ```
- **Stop containers and remove volumes (reset DB)**:
    ```bash
    docker-compose down -v
    ```
- **View logs**:
    ```bash
    docker-compose logs -f
    ```

### Admin Account Creation

To create an admin account, you can use the hidden frontend registration page:

- **URL**: [http://localhost:8080/admin/register](http://localhost:8080/admin/register)

Alternatively, you can use the backend endpoint directly (note: this endpoint is hidden from API documentation):

**POST** `http://localhost:8000/api/v1/auth/create-admin`

**Body:**

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securepassword",
  "phone": "+1234567890"
}
```
