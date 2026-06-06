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

## Backend

The `backend/` folder is reserved for the API server. Keep frontend and backend env files separate:

- `frontend/.env` — public config safe for the browser
- `backend/.env` — secrets, database URLs, JWT keys (never expose to frontend)
