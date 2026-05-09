# prod-miniature

**Production architecture in miniature** — FastAPI, PostgreSQL, Redis, Nginx, all containerized with Docker Compose.

Built from scratch for learning, experimentation, and as a foundation for future scaling.

## Architecture

Browser → Nginx (:80) → FastAPI (:8000) → PostgreSQL (:5432)
└→ Redis (:6379)

| Service    | Role                                      |
|------------|-------------------------------------------|
| Nginx      | Reverse proxy, static files, gzip         |
| FastAPI    | REST API, async SQLAlchemy, UUID v7       |
| PostgreSQL | Primary database (UUID v7 native support) |
| Redis      | Response caching, cache invalidation      |

## Tech Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn
- **Database:** PostgreSQL 18 (Alpine), asyncpg
- **ORM:** SQLAlchemy 2.0 (async), UUID v7 via `uuid_utils`
- **Cache:** Redis 7, TTL-based caching with write invalidation
- **Proxy:** Nginx (Alpine), gzip, upstream balancing
- **Infra:** Docker Compose, healthchecks, named volumes, `.env`-driven config

## Quick Start

```bash
git clone https://github.com/ultramara/prod-miniature.git
cd prod-miniature

# Create .env from example
cp .env.example .env

# Build and run
docker-compose up --build -d
```

Open http://localhost in your browser.

## Environment Variables

Copy .env.example to .env and adjust:

Variable	Default	Description
POSTGRES_USER	admin	PostgreSQL user
POSTGRES_PASSWORD	changeme	PostgreSQL password
POSTGRES_DB	microdb	Database name
REDIS_HOST	redis	Redis hostname
REDIS_PORT	6379	Redis port

## Scaling & Resilience
```bash
# Run 3 backend replicas
docker-compose up --scale backend=3 -d

# Kill one instance — Nginx automatically routes to healthy ones
docker stop prod-miniature-backend-2

# Bring it back
docker start prod-miniature-backend-2
```

Nginx uses upstream block with Docker DNS round-robin for load balancing.

## Project Structure
```text
prod-miniature/
├── backend/
│   ├── app/
│   │   ├── api/routers/    # Route handlers
│   │   ├── core/           # Config, settings
│   │   ├── db/             # Database setup, async sessions
│   │   ├── models/         # SQLAlchemy models
│   │   ├── redis/          # Redis client
│   │   └── schemas/        # Pydantic schemas
│   ├── Dockerfile
│   └── requirements.txt
├── nginx/
│   └── default.conf
├── frontend/
│   ├── index.html
│   ├── styles/
│   └── scripts/
├── db/
│   └── init.sql
├── docker-compose.yml
├── .env.example
└── .gitignore
```
