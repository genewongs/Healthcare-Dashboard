# Healthcare Dashboard

Full-stack healthcare dashboard take-home assessment for managing patient records, notes, and deterministic patient summaries.

The app focuses on the core assessment requirements: patient CRUD, search/filter/sort/pagination, notes, summary generation, PostgreSQL persistence, and a Docker Compose local workflow. It intentionally avoids auth and real LLM integration to keep scope aligned with the assessment, while including a few focused UI stretch goals such as dark/light theme switching, advanced filters, and patient status visualization.

## Tech Stack

- Frontend: React, TypeScript, Vite, Material UI, React Router, TanStack Query, React Hook Form, Zod
- Backend: FastAPI, SQLAlchemy, Pydantic, PostgreSQL
- Local development: Docker Compose

## Architecture Decisions

- The backend uses synchronous FastAPI + SQLAlchemy for a simple, readable take-home implementation.
- Tables are created on startup with `Base.metadata.create_all()` instead of Alembic migrations.
- Seed data is idempotent and runs at startup after tables are created.
- The patient summary endpoint is deterministic and template-based, not LLM-backed.
- The frontend keeps API calls in `src/api`, shared types in `src/types`, and reusable UI components under `src/components`.
- React Query owns frontend server state for fetching, cache invalidation, and mutation refreshes.
- The frontend includes ESLint and Prettier for TypeScript linting and formatting checks.

## Run With Docker

From the repo root:

```sh
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Backend health check: http://localhost:8000/health
- PostgreSQL: localhost:5433

PostgreSQL is exposed on host port `5433` to avoid conflicts with local Postgres installs. Inside Docker, the backend connects to the database through the Compose service name `db` on port `5432`.

## Environment Variables

Root `.env.example`:

```sh
POSTGRES_DB=healthcare_dashboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@db:5432/healthcare_dashboard
POSTGRES_HOST_PORT=5433
```

Frontend:

```sh
VITE_API_URL=http://localhost:8000
```

Backend:

```sh
DATABASE_URL=postgresql://postgres:postgres@db:5432/healthcare_dashboard
```

## Frontend Tooling

From `frontend/`:

```sh
npm run lint
npm run format:check
npm run build
```

Use `npm run format` to apply Prettier formatting.

## Backend API

Health:

- `GET /health`

Patients:

- `GET /patients`
- `GET /patients/{id}`
- `POST /patients`
- `PUT /patients/{id}`
- `DELETE /patients/{id}`

Patient list query parameters:

- `page`
- `page_size`
- `search`
- `status`
- `age_min`
- `age_max`
- `last_visit_from`
- `last_visit_to`
- `sort_by`
- `sort_order`

Patient notes:

- `GET /patients/{id}/notes`
- `POST /patients/{id}/notes` - create a note with `content`, `category`, and `is_pinned`
- `PATCH /patients/{id}/notes/{note_id}` - update note pinned state
- `DELETE /patients/{id}/notes/{note_id}`

Patient summary:

- `GET /patients/{id}/summary`

## Frontend Routes

- `/` - dashboard placeholder
- `/patients` - patient list with search, advanced filters, sort, pagination, dark/light theme toggle, and patient status visualization
- `/patients/new` - create patient
- `/patients/:id` - patient detail, notes, summary, delete action
- `/patients/:id/edit` - edit patient
- `*` - not found page

## Seed Data

The backend seeds 20 realistic patients on startup after tables are created. Seeding is idempotent: it only runs when the patients table has no existing records.

This keeps local setup fast and predictable while avoiding duplicate records across app restarts.

## Known Tradeoffs

- `Base.metadata.create_all()` is acceptable for this take-home, but Alembic migrations would be better in production.
- The summary endpoint is deterministic and template-based, so it is reliable but not semantically rich like a real LLM summary.
- Frontend filtering, sorting, search, and pagination are server-backed, but query params are kept in local component state instead of URL state.
- The frontend currently uses Vite dev server in Docker, which is convenient for local review but not a production deployment setup.
- Dark/light theme preference is kept in local React state for this take-home rather than persisted to storage.
- Automated tests were intentionally skipped to preserve iteration speed and stay within the requested scope.

## Intentionally Skipped

- Authentication and authorization
- Real LLM integration
- Production deployment configuration
- Alembic migrations
- File uploads
- Role-based access controls
- Broad stretch goals beyond the focused UI additions already included
