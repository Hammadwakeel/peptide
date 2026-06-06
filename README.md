# Frontier Nexus Rx

Monorepo for the Frontier Nexus Rx platform: a Next.js frontend and a backend folder reserved for the API.

```
Frontier-Nexus-Rx/
├── backend/     # API server (empty — to be implemented)
├── frontend/    # Next.js web application
└── README.md
```

## Frontend

The frontend is a **Next.js 16** app with the public landing site, login flow, Lenis smooth scrolling, Framer Motion animations, and skeleton loading states.

### Getting started

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Start development server |
| `pnpm build`  | Production build         |
| `pnpm start`  | Start production server  |
| `pnpm lint`   | Run ESLint               |

## Git remotes

This monorepo pushes to two remotes with different layouts:

| Remote | Repo | What gets pushed |
| ------ | ---- | ---------------- |
| `frontier-nexus` | [Frontier-Nexus-Rx](https://github.com/muhammadhasnain100/Frontier-Nexus-Rx) (Hasnain) | Full monorepo: `frontend/` + `backend/` |
| `origin` | Hammadwakeel/peptide (Hammad) | **Frontend only** (app files at repo root, no `backend/`) |

From the repo root:

```bash
pnpm push:hasnain   # monorepo → Hasnain
pnpm push:hammad    # frontend subtree → Hammad
pnpm push:all       # both
```

Or run `./scripts/push-remotes.sh`.

## Deploy on Vercel

### Hasnain (Frontier-Nexus-Rx monorepo)

Set **Root Directory** to `frontend` (or use the root `vercel.json` which builds from `frontend/`).

### Hammad (peptide — frontend-only repo)

Deploy from repo root. Next.js lives at the top level; use **pnpm** as the package manager.

## Backend

The `backend/` folder is reserved for the API server. Keep frontend and backend env files separate:

- `frontend/.env` — public config safe for the browser
- `backend/.env` — secrets, database URLs, JWT keys (never expose to frontend)
