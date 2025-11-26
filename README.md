InWatch Monitor
================

## Why this repo exists

InWatch Monitor is a small monorepo that I use to practice Node.js and Cloudflare Workers while keeping the idea close to real work. My day-to-day stack is .NET Core, so I wanted a simple but useful project to explore another runtime and to test the Worker + Pages workflow. The goal is to check different portals, store the latest status in D1, and expose a lightweight status page. The check is intentionally minimalist: a site is “healthy” when it returns HTTP 200. No advanced logic, just the basics to learn the platform.

## Project structure

```
/backend   Cloudflare Worker with Express-style routing, JWT auth, D1 storage
/frontend  React + Vite client that can render the status page on Cloudflare Pages
```

This layout keeps the Worker API and the UI in the same repository so I can share utilities, track issues, and deploy both parts together if needed.

## CustomResponse pattern

All backend endpoints return a `CustomResponse` object (`typeOfResponse`, `message`, `data`). This is not an industry rule; it is a personal choice that I reuse in other .NET Core and Python services. It lets me control what the client sees, avoid leaking raw stack traces, and keep a predictable envelope for Postman collections or frontend adapters. Because of that preference, every controller builds or forwards a `CustomResponse` instead of sending the service return directly. Anyone using the API should expect that envelope.

## Backend (Cloudflare Worker)

- **Stack:** Wrangler 4, `nodejs_compat`, Express, D1 Database, jose for JWT.
- **Install:**

  ```bash
  cd backend
  npm install
  ```

- **Secrets and env vars:**

  ```
  npx wrangler d1 create monitor-status-db           # once, creates D1
  npx wrangler secret put JWT_SECRET
  npx wrangler secret put ADMIN_PWD
  npx wrangler secret put JWT_EXPIRES_IN
  ```

  Non-sensitive values (CORS origins, retention windows, etc.) live in `wrangler.jsonc` under `vars`.

- **Run locally:** `npm run dev` (npx wrangler dev). The Worker listens on port 3000 internally and is proxied by Wrangler on `http://127.0.0.1:8787`.
- **Deploy:** `npm run deploy`.

### API endpoints (JWT protected unless noted)

| Method | Path                     | Description                                       |
| ------ | ------------------------ | ------------------------------------------------- |
| POST   | `/auth/login`            | Public. Checks `ADMIN_PWD`, returns JWT.     |
| GET    | `/sites/`                | Returns every monitored site.                     |
| POST   | `/sites/`                | Creates a site (`check_url`, `displayname`).      |
| PUT    | `/sites/`                | Updates a site by `id`.                           |
| DELETE | `/sites/`                | Deletes a site by `id`.                           |
| POST   | `/monitor/doHealthCheck` | Manually triggers health checks (admin use).      |
| GET    | `/reports/status`        | Public summary of the current status list.        |

All responses follow the `CustomResponse` wrapper. Data shapes come from DTOs so field names stay stable (`id`, `check_url`, `name`).

### Health checks

The Worker can run on schedule (see `wrangler.jsonc` cron triggers) to call the monitor service, store results in D1, and clean older entries after a configurable time window. You can still call `/monitor/doHealthCheck` manually when testing.

## Frontend (Cloudflare Pages / Vite)

- **Stack:** React 18 + Vite.
- **Install:**

  ```bash
  cd frontend
  npm install
  ```

- **Run locally:** `npm run dev` (Vite dev server, default port 5173). Configure API URL via Vite env vars (e.g., `VITE_API_BASE`) if needed.
- **Deploy:** push to Cloudflare Pages or any static host. The build output lives in `frontend/dist` (`npm run build`).

## How to start locally

1. Clone the repo and install dependencies in both `backend/` and `frontend/`.
2. Configure Wrangler (login and create the D1 database).
3. Set the required secrets (`JWT_SECRET`, `ADMIN_PASSWORD`) and any optional vars (`CORS_ALLOWED_ORIGINS`, retention hours).
4. Run `npm run dev` inside `backend/` to expose the Worker.
5. Run `npm run dev` inside `frontend/` and point the client to the Worker URL.

At this point you can open Postman or the frontend to log in (`/auth/login`), copy the JWT, and use the `/sites` endpoints to add monitored URLs. Every run only checks for HTTP 200 responses, keeping the logic easy to read.

## Motivation recap

- Practice Node.js/Express patterns without leaving the Cloudflare Worker context.
- Reuse concepts I already use in .NET Core (CustomResponse, DTO mapping) to keep learning comfortable.
- Evaluate Cloudflare Workers + Pages for small monitoring utilities and see how D1 fits in the workflow.

Feel free to fork or open issues—this repo is meant as a portfolio-friendly starter that stays approachable while touching real services and deployments.
