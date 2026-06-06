# VapeBay

Vape/e-cigarette product catalog. Three services share one PostgreSQL database (`vapeshop_db`):

- **`frontend/`** — Nuxt 3 (TypeScript) buyer UI
- **`backend-api/`** — NestJS REST API at `/api/products`
- **`backend-admin/`** — Laravel 12 + Filament admin panel

No Docker. Local PostgreSQL on `localhost:5432`.

## Prerequisites

- Node.js 20+
- PHP 8.2+ with `pdo_pgsql` and `pgsql` extensions enabled
- Composer 2+
- PostgreSQL 14+ running on `localhost:5432` with user `postgres`, password `1`

## First-time setup

```bash
# 1. Create the shared database
node scripts/create-db.mjs

# 2. Backend API (NestJS)
cd backend-api
npm install
npx ts-node -r dotenv/config src/seed.ts   # seeds the 8 demo products

# 3. Admin panel (Laravel + Filament)
cd ../backend-admin
composer install
php artisan migrate --seed
# Default admin user: admin@vapebay.local / password

# 4. Frontend (Nuxt)
cd ../frontend
npm install
```

## Running the apps

### One command (recommended)

From the repo root:

```bash
npm run dev
```

This uses `concurrently` to start all three services in parallel, with color-prefixed output:

- `[api]` — NestJS API on http://localhost:3001
- `[admin]` — Laravel + Filament on http://localhost:8000/admin
- `[web]` — Nuxt on http://localhost:3000

Press `Ctrl+C` once to stop all three. If any one of them crashes, the others are killed automatically.

The first time you run this you'll also need to install the runner itself:

```bash
npm install   # at the repo root, installs concurrently
```

**Trade-off:** the API runs without `nest start --watch` in this mode so Ctrl+C can stop it cleanly. If you want backend HMR, run `cd backend-api && npm run start:dev` in its own terminal.

### Three terminals (fallback)

If you want per-service control (e.g. restart one without touching the others), open three terminals:

```bash
# terminal 1 — NestJS API on http://localhost:3001
cd backend-api && npx ts-node -r dotenv/config src/main.ts

# terminal 2 — Laravel + Filament on http://localhost:8000
cd backend-admin && php artisan serve --host=127.0.0.1 --port=8000

# terminal 3 — Nuxt on http://localhost:3000
cd frontend && npm run dev
```

Default Filament login: `admin@vapebay.local` / `password` (change before deploying).

## Tests

```bash
cd backend-api && npm test            # unit (4 tests)
cd backend-api && npm run test:e2e    # e2e against vapeshop_e2e DB (5 tests)
cd backend-admin && php artisan test  # Laravel smoke tests
```

Single test:
```bash
cd backend-api && npm test -- products.service.spec.ts
cd backend-api && npm run test:e2e -- products.e2e-spec.ts
```

## Architecture

- **Three services, one database.** NestJS owns writes/reads via REST. Filament talks to Postgres directly for admin CRUD. Nuxt never touches the DB; it always goes through NestJS.
- **CORS** on NestJS allows `http://localhost:3000` (Nuxt dev port). Frontend base URL is `NUXT_PUBLIC_API_BASE` (default `http://localhost:3001`).
- **Schema** is intentionally minimal:

```sql
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

- **Prices are in IDR** (Indonesian Rupiah). `450000.00` is a normal value.
- **Pagination envelope** (NestJS list responses): `{ data: Product[], meta: { total, page, limit, totalPages } }`.

See `CLAUDE.md` for the full code-style guide, validation rules, UI copy, and gotchas.

---

## Running the apps with Docker (alternative)

If you'd rather skip native installs of Node / PHP / Composer, the repo ships a `docker-compose.yml` that runs all three services plus Postgres:

```bash
cp .env.example .env
docker compose up --build
```

- Frontend → http://localhost:3000
- API → http://localhost:3001/api/products
- Admin → http://localhost:8000/admin (login: `admin@vapebay.local` / `password`)
- Postgres → localhost:5432 (`postgres` / `1` / `vapeshop_db`)

The API and admin point at the same Postgres, so writes from NestJS show up in Filament immediately.

---

## CI/CD

`.gitlab-ci.yml` defines three stages:

| Stage  | Job             | What it does                                       |
|--------|-----------------|----------------------------------------------------|
| build  | `build:frontend`| `npm ci && npm run build` in `frontend/`           |
| build  | `build:api`     | `npm ci && npm run build` in `backend-api/`        |
| build  | `build:admin`   | `composer install` + `php artisan key:generate`    |
| test   | `test:api-unit` | Jest unit suite against a `postgres:16` service    |
| test   | `test:api-e2e`  | Jest e2e suite against `vapeshop_e2e` database     |
| test   | `test:admin`    | `php artisan test` (Laravel smoke tests)           |
| deploy | `deploy:staging`| `when: manual` — see the job body for deploy steps |

The `deploy:staging` job is `when: manual` and only describes the steps (no actual deploy runs) per the technical-test instructions. Pipeline triggers on every push to any branch.

---

## Deployment (Digital Ocean + Terraform)

This section documents the production topology. No infrastructure has been provisioned — the steps below are the runbook a maintainer would follow after `terraform apply`.

### Topology

```
                       ┌──────────────────────┐
                       │   Digital Ocean      │
                       │   droplet (Ubuntu)   │
                       │                      │
                       │  ┌──────────────┐    │
        Browser ──────►│  │  nginx :80   │    │
                       │  │  reverse     │    │
                       │  │  proxy       │    │
                       │  └──────┬───────┘    │
                       │         │            │
                       │  ┌──────▼───────┐    │
                       │  │ web (Nuxt)   │    │
                       │  │ :3000        │    │
                       │  └──────┬───────┘    │
                       │         │            │
                       │  ┌──────▼───────┐    │
                       │  │ api (NestJS) │    │
                       │  │ :3001        │    │
                       │  └──────┬───────┘    │
                       │         │            │
                       │  ┌──────▼───────┐    │
                       │  │ admin (Larv) │    │
                       │  │ :8000/admin  │    │
                       │  └──────┬───────┘    │
                       │         │            │
                       │  ┌──────▼───────┐    │
                       │  │ Postgres 16  │    │
                       │  │ (managed)    │    │
                       │  └──────────────┘    │
                       └──────────────────────┘
```

### Terraform outline

The `terraform/` directory would contain:

- `versions.tf` — pinned `hashicorp/digitalocean` provider
- `droplet.tf` — single `digitalocean_droplet` for the app (SFO3, 2 vCPU / 4 GB)
- `db.tf` — `digitalocean_database_cluster` (Postgres 16) + connection pool
- `firewall.tf` — allow 22 (SSH) + 80/443 (nginx) inbound; deny Postgres from public
- `dns.tf` — `digitalocean_domain` + A records for `vapebay.example.com` / `admin.vapebay.example.com` / `api.vapebay.example.com`
- `outputs.tf` — `droplet_ip`, `db_connection_string`

Apply flow:

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
# Capture the output for CI:
terraform output -json > ../infra.json
```

### Server setup (one-time, after `terraform apply`)

```bash
# SSH in, install Docker + the Compose plugin:
ssh root@<droplet_ip>
apt update && apt install -y docker.io docker-compose-plugin
usermod -aG docker deploy

# Pull the three images built by CI:
docker compose -f /opt/vapebay/docker-compose.prod.yml pull
docker compose -f /opt/vapebay/docker-compose.prod.yml up -d

# Run migrations + seed once:
docker compose exec api node dist/main.js --seed
docker compose exec admin php artisan migrate --force --seed
```

### Deploy (per release)

```bash
# On the droplet, as `deploy`:
cd /opt/vapebay
git pull --rebase origin main
docker compose pull
docker compose up -d --no-deps api web admin
docker compose exec api node dist/main.js --seed   # idempotent
```

The `deploy:staging` GitLab job is the human gate before any of this runs.
