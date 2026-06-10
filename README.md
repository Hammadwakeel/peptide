# Frontier Nexus Rx

Multi-tenant healthcare commerce platform — RUO peptides and pharmacy products for clinics, with branded patient storefronts, affiliate tracking, and admin operations.

```
Frontier-Nexus-Rx/
├── frontend/              # Next.js 16 web app (landing, login, portals)
├── backend/
│   ├── database/          # Cloud SQL schema, migrations, connection
│   ├── identity-service/  # Auth, onboarding, affiliates (port 3001)
│   ├── commerce-service/  # Inventory, clinic store, patient catalog (port 3002)
│   ├── communication-service/  # Chat (port 3003) — MongoDB + Redis + Kafka
│   └── shared/            # Shared TypeScript utilities
└── README.md
```

## Architecture

| Service | Port | Stack | Responsibility |
|---------|------|-------|----------------|
| **Identity** | 3001 | Python / FastAPI | Login, OTP, JWT, clinic/doctor/patient/affiliate/admin onboarding |
| **Commerce** | 3002 | Python / FastAPI | Master inventory, clinic My Store pricing, patient storefront |
| **Communication** | 3003 | Python / FastAPI | Provider–patient chat (Postgres metadata, MongoDB messages, Redis/Kafka real-time) |
| **Database** | — | PostgreSQL (Cloud SQL) | Shared DB for identity/commerce + conversation metadata |

All services share one PostgreSQL database and validate JWTs issued by the identity service.

---

## Prerequisites

- **Node.js 20+** and **pnpm 10+**
- **Python 3.10+**
- **pip** packages: see service `requirements.txt` files under `backend/identity-service`, `backend/commerce-service`, `backend/communication-service`, and `backend/common-service`
- GCP Cloud SQL credentials (local dev: service account JSON in `backend/database/`)

---

## Quick start

### 1. Install frontend dependencies

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend: [http://localhost:3000](http://localhost:3000)

### 2. Configure backend environment

Copy example env files and fill in secrets:

```bash
cp backend/.env.example backend/.env
cp backend/database/.env.example backend/database/.env   # create if missing
cp backend/identity-service/.env.example backend/identity-service/.env   # or edit existing
cp backend/commerce-service/.env.example backend/commerce-service/.env   # or edit existing
cp backend/communication-service/.env.example backend/communication-service/.env   # or edit existing
```

Each service folder has its own `.env`. **Never commit `.env` files or GCP JSON keys.**

### 3. Install Python dependencies

```bash
pip3 install -r backend/common-service/requirements.txt
pip3 install -r backend/identity-service/requirements.txt
pip3 install -r backend/commerce-service/requirements.txt
pip3 install -r backend/communication-service/requirements.txt
```

### 4. Run database migrations

```bash
pnpm --dir backend db:migrate
pnpm --dir backend db:verify
```

### 5. Seed test data

```bash
pnpm --dir backend identity:seed    # admin, clinic, main affiliate users
pnpm --dir backend commerce:seed    # sample inventory + clinic store products
```

### 6. Start backend services

```bash
pnpm --dir backend identity:dev     # http://localhost:3001
pnpm --dir backend commerce:dev     # http://localhost:3002
cd backend/communication-service && python main.py   # http://localhost:3003
```

---

## API documentation (Swagger)

| Service | Swagger UI | Health check |
|---------|------------|--------------|
| Identity | [http://localhost:3001/docs](http://localhost:3001/docs) | `GET /health` |
| Commerce | [http://localhost:3002/docs](http://localhost:3002/docs) | `GET /health` |
| Communication | [http://localhost:3003/docs](http://localhost:3003/docs) | `GET /health` |

### Swagger authorization

1. Call **POST /auth/login** on identity service (port 3001)
2. Copy the `token` from the response
3. Click **Authorize** in Swagger and paste the token
4. Protected endpoints on both services will send `Authorization: Bearer <token>` automatically

---

## Test accounts

Password for all seeded accounts: **`Test1234!`**

| Role | Login `role` | Email |
|------|--------------|-------|
| Admin | `admin` | `dev@avishkarai.com` |
| Clinic / Doctor | `doctor` | `hasnainnaseer987@gmail.com` |
| Main Affiliate | `affiliate` | `hooriaajmal9@gmail.com` |
| Patient | `patient` | `patient.test@frontier.com` |

---

## Backend scripts

Run from repo root:

| Command | Description |
|---------|-------------|
| `pnpm --dir backend db:migrate` | Apply SQL migrations to Cloud SQL |
| `pnpm --dir backend db:verify` | Verify tables per service |
| `pnpm --dir backend db:test` | Test database connection |
| `pnpm --dir backend identity:dev` | Start identity service (:3001) |
| `pnpm --dir backend identity:seed` | Seed test users |
| `pnpm --dir backend commerce:dev` | Start commerce service (:3002) |
| `pnpm --dir backend commerce:seed` | Seed sample products |
| `cd backend/communication-service && python main.py` | Start communication service (:3003) |

---

## Key API endpoints

### Identity service (`:3001`)

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/login`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/refresh-token` |
| Doctor | `POST /doctor/apply`, `POST /doctor/patients/invite`, `GET /doctor/patients` |
| Patient | `POST /patient/accept-invitation` |
| Admin | `GET /admin/clinics/pending`, `POST /admin/clinics/{id}/review`, `GET /admin/clinics` |
| Affiliate | `POST /affiliate/sub-affiliates/invite`, `GET /affiliate/referrals/clinics` |

### Commerce service (`:3002`)

| Area | Endpoints |
|------|-----------|
| Admin inventory | `POST /admin/products`, `GET /admin/products`, `PUT /admin/products/{id}` |
| Clinic catalog | `GET /clinic/inventory`, `GET /clinic/store/products`, `POST /clinic/store/products` |
| Patient storefront | `GET /patient/store/products` |

### Communication service (`:3003`)

| Area | Endpoints |
|------|-----------|
| Conversations | `POST /conversations`, `GET /conversations`, `GET /conversations/me` |
| Messages | `GET/POST /conversations/{id}/messages`, `POST /conversations/{id}/messages/upload` |
| Real-time | `WS /ws/chat?token=<jwt>` |
| Templates | `GET /message-templates` |

All list endpoints support pagination: `?page=1&limit=20` (max 100).

---

## Database

- **Engine:** PostgreSQL on GCP Cloud SQL
- **Migrations:** `backend/database/schema/*.sql` (applied via `migrate.py`)
- **Modules:** Auth, Clinics, Patients, Products, Orders, Chat, Accounting, Affiliate, Compliance (~60 tables)
- **Connection:** `backend/database/connection.py` (Python), shared across all services

```bash
cd backend/database
python3 migrate.py    # apply migrations
python3 verify.py     # list tables by service
python3 test.py       # connection test
```

---

## Environment variables

### Shared (all services)

| Variable | Description |
|----------|-------------|
| `CLOUD_SQL_INSTANCE` | GCP Cloud SQL instance connection name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name (`sql-data`) |
| `JWT_SECRET` | Must match across identity + commerce services |

### Identity service

| Variable | Description |
|----------|-------------|
| `IDENTITY_SERVICE_PORT` | Default `3001` |
| `SMTP_EMAIL` / `SMTP_PASSWORD` | Gmail for OTP and credential emails |
| `FRONTEND_URL` | Base URL for invitation links |

### Commerce service

| Variable | Description |
|----------|-------------|
| `COMMERCE_SERVICE_PORT` | Default `3002` |

Keep secrets in per-service `.env` files. Use `.env.example` files as templates only.

---

## Frontend

Next.js 16 app with landing page, login flow (Patient / Provider toggle), Lenis smooth scroll, and Framer Motion.

```bash
cd frontend
pnpm install
pnpm dev      # development
pnpm build    # production build
pnpm lint     # ESLint
```

| Command (root) | Description |
|----------------|-------------|
| `pnpm dev` | Start frontend dev server |
| `pnpm build` | Production build |

---

## Git remotes

| Remote | Repo | Contents |
|--------|------|----------|
| `frontier-nexus` | [Frontier-Nexus-Rx](https://github.com/muhammadhasnain100/Frontier-Nexus-Rx) | Full monorepo |
| `origin` | Hammadwakeel/peptide | Frontend only (subtree) |

```bash
pnpm push:hasnain   # full monorepo
pnpm push:hammad    # frontend subtree only
pnpm push:all       # both
```

---

## Deploy on Vercel

**Hasnain (monorepo):** set Root Directory to `frontend`.

**Hammad (frontend-only repo):** deploy from repo root with **pnpm**.

Backend services deploy separately (not on Vercel) — e.g. Cloud Run, Railway, or a VPS with `uvicorn`.

---

## Security notes

- Do **not** commit `.env`, passwords, JWT secrets, or GCP service account JSON files
- `.gitignore` covers `backend/`, `frontend/`, and root-level secrets
- Rotate credentials if they were ever committed to git
- Use GCP Secret Manager in production

---

## License

Proprietary — PeptiPharma Rx / Frontier Nexus Rx.
