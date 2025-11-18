# NextGen CRM - Backend (Express + Prisma + Socket.io)

## Requirements
- Node.js 18+
- PostgreSQL (local or remote)
- npm

## Setup
1. Clone repo
2. Copy env: `cp .env.example .env` and edit `DATABASE_URL`, `JWT_SECRET`, etc.
3. Install:
   npm install

4. Generate Prisma client:
   npx prisma generate

5. Run migration (creates tables):
   npx prisma migrate dev --name init

6. Seed admin user:
   npm run seed
   (or set SEED_ADMIN_EMAIL/PASSWORD in .env then run npm run seed)

7. Start server:
   npm run dev
   Server -> http://localhost:5000

## API endpoints
- POST /api/v1/auth/register {name, email, password, role?}
- POST /api/v1/auth/login {email, password}
- GET /api/v1/auth/me Authorization: Bearer <token>

- GET /api/v1/leads
- POST /api/v1/leads (Auth required)
- GET /api/v1/leads/:id
- PUT /api/v1/leads/:id (Auth required)
- DELETE /api/v1/leads/:id (Auth required)
- POST /api/v1/leads/:id/activities (Auth required)

## WebSocket
Connect to Socket.io server at `ws://localhost:5000`. Join global room by emitting `presence:join`. Server will emit:
- `notification:new_lead` when a lead is created
- `notification:lead_updated` when a lead is updated

## Tests
Start the server (`npm run dev`) in one terminal. Then run:
  npm test

## Next steps I can do for you (ask me to proceed):
- Add more robust tests (Jest+Supertest) that programmatically start/stop the app
- Add role-protected user management endpoints
- Add email notifications (nodemailer) and integration with socket notifications
- Add Docker Compose file
- Implement frontend scaffold (React + Redux Toolkit + Socket.io-client)

README updates & Quick Start (run everything)

Add these steps/notes to your README.

Local (non-Docker) quick start

Backend:

cp .env.example .env
# edit .env: set DATABASE_URL (postgres local), JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev


Frontend:

cd frontend
npm install
npm start


Visit:

Frontend: http://localhost:3000

Backend: http://localhost:5000

WebSocket: ws://localhost:5000

Email previews: check backend logs for Ethereal preview URL when lead created.

Docker quick start
# Ensure Docker is running
docker-compose up --build
# Wait for database migration: you may still need to run prisma migrate & seed inside backend container once DB ready.
# To run migrations inside backend container:
docker-compose exec backend sh -c "npx prisma migrate deploy || npx prisma migrate dev --name init --preview-feature"
docker-compose exec backend sh -c "npm run seed"


Notes: depending on timing you may need to run prisma migrate manually inside container after the DB finishes initializing.

Running tests

Set a dedicated test DB (avoid running tests against production DB):

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextgencrm_test?schema=public"
npm test

What I didn’t change (yet) and next micro-tasks I can do immediately on request

Convert tests to spin up ephemeral test DB (pg-mem) — recommended for CI.

Add CI/CD (GitHub Actions) pipeline (Docker build + test).

Add richer charts (Chart.js with data labeling) and filter controls.

Add RBAC on UI (show/hide admin links based on role).

Add Slack / HubSpot integration webhooks (bonus).

Polish UI (styling, responsive layout) — currently functional minimal UI.

Final notes & verification checklist

Backend: analytics routes at /api/v1/analytics/leads-by-day and /api/v1/analytics/conversion.

Frontend: CreateLead, LeadDetail activity flow, AdminUsers UI, Dashboard placeholder with room for charts (I integrated chart libs; I can populate charts with API data in the next pass).

Real-time: Socket.io emits notification:new_lead and frontend updates lead list in realtime.

Emails: nodemailer with Ethereal used by default — preview URLs printed in backend logs.

Docker: Dockerfile (backend, frontend) and docker-compose.yml included.

Tests: programmatic server tests for auth & leads — use dedicated DB.
