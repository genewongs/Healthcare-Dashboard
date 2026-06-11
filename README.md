# Healthcare Dashboard

A full-stack healthcare dashboard for managing patient records, notes, and deterministic patient summaries.

## Quick Start

From the repo root:

```sh
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Seed / Rebuild Data

Data is seeded automatically on startup when the database is empty.

To force a fresh seed and rebuild the database:

```sh
docker compose down -v
docker compose up --build
```

## Tech Stack

- Frontend: React, TypeScript, Vite, Material UI
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Local development: Docker Compose

## What it includes

- Patient CRUD
- Search, filter, sort, pagination
- Notes with pinning
- Deterministic patient summaries
- Dashboard metrics and visualizations
- PostgreSQL persistence with Alembic migrations

## Important Commands

```sh
# Start app via Docker
docker compose up --build

# Reset database and reseed
docker compose down -v
docker compose up --build
```

## Environment

The compose stack uses:

- `POSTGRES_DB=healthcare_dashboard`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/healthcare_dashboard`
- `VITE_API_URL=http://localhost:8000`

## Frontend Commands

From `frontend/`:

```sh
npm run lint
npm run format:check
npm run build
```

## API Endpoints

- `GET /health`
- `GET /patients`
- `GET /patients/stats`
- `GET /patients/{id}`
- `POST /patients`
- `PUT /patients/{id}`
- `DELETE /patients/{id}`
- `GET /patients/{id}/notes`
- `POST /patients/{id}/notes`
- `PATCH /patients/{id}/notes/{note_id}`
- `DELETE /patients/{id}/notes/{note_id}`
- `GET /patients/{id}/summary`
- `GET /dashboard/stats`

## Frontend Routes

- `/` — dashboard
- `/patients` — patient list
- `/patients/new` — create patient
- `/patients/:id` — patient detail
- `/patients/:id/edit` — edit patient
