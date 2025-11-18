# Next-Gen CRM — README

**Project**: Next-Gen CRM System Challenge
**Stack**: Node.js (Express) + Prisma + PostgreSQL + Socket.io (backend) — React + Redux Toolkit + Tailwind (frontend)
**Deployed Backend (API)**: `https://next-gen-crm-system-challenge.onrender.com/api/v1`
**Notes**: This README documents setup, verification, integrations (Slack, HubSpot), tests, and quick troubleshooting to help you submit confidently.

---

## Table of contents

1. Quick demo checks
2. Repo layout
3. Environment variables (all keys)
4. Local setup (backend)
5. Local setup (frontend)
6. Database (Prisma) migrations & seed
7. Running the deployed checks (curl) — verified commands using deployed URL
8. Integrations: Slack & HubSpot (setup + URLs)
9. Tests (pg-mem)
10. Docker (quick)
11. Troubleshooting & common issues
12. What I implemented / feature list

---

## 1 — Quick demo checks (run these first)

These verify the deployment and basic functionality.

Health:

```bash
curl -s https://next-gen-crm-system-challenge.onrender.com/api/v1/ | jq
# Expect: {"ok":true,"msg":"NextGen CRM backend"}
```

Register (if needed) & login:

```bash
curl -s -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@local.test","password":"Admin@123","role":"ADMIN"}' | jq

curl -s -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.test","password":"Admin@123"}' | jq
```

Save the returned `token` as `TOKEN` for subsequent commands.

Create a lead (triggers email, Slack, HubSpot if configured):

```bash
curl -s -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/leads" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead 001","email":"lead001@example.com","phone":"9999999999","source":"Website","value":1500}' | jq
```

List leads:

```bash
curl -s "https://next-gen-crm-system-challenge.onrender.com/api/v1/leads" | jq
```

Get analytics:

```bash
curl -s -H "Authorization: Bearer $TOKEN" "https://next-gen-crm-system-challenge.onrender.com/api/v1/analytics/leads-by-day?range=30" | jq
curl -s -H "Authorization: Bearer $TOKEN" "https://next-gen-crm-system-challenge.onrender.com/api/v1/analytics/conversion" | jq
```

---

## 2 — Repo layout (high level)

```
backend/
  src/
    app.js
    server.js
    routes/
      auth.js
      leads.js
      users.js
      analytics.js
      integrations/
        hubspot.js
        slack.js
        slackActions.js
    services/
      mail.js
      slack.js
      hubspot.js
    utils/
      assignment.js
    prismaClient.js
  prisma/
    schema.prisma
  package.json

frontend/
  src/
    App.js
    index.js
    pages/
      Login.js
      Dashboard.js
      Leads.js
      LeadDetail.js
      CreateLead.js
      AdminUsers.js
      AdminSlackMapping.js
    store/
      slices/
        authSlice.js
        leadsSlice.js
  package.json

docker-compose.yml
README.md   <-- you are here
```

---

## 3 — Environment variables (complete list)

Set these locally in `.env` (backend root) and on Render (Environment variables). Keep secrets secret.

**Core**

```
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>?schema=public
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Email**

```
MAIL_FROM="NextGen CRM <no-reply@nextgencrm.local>"
# Optional: real SMTP for production
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
```

**Slack (required for interactive messages)**

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_CHANNEL_ID=C0123456789
```

**HubSpot (optional)**

```
HUBSPOT_CLIENT_ID=...
HUBSPOT_CLIENT_SECRET=...
HUBSPOT_REDIRECT_URI=https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/callback
HUBSPOT_SCOPES=contacts
```

**Feature flags**

```
AUTO_ASSIGN_ROTATION=true
```

---

## 4 — Local setup (backend) — copy-paste

```bash
# 1. clone repo, cd backend
npm install

# 2. copy env
cp .env.example .env
# edit .env to set DATABASE_URL and JWT_SECRET (and optionally Slack/HubSpot/SMTP)

# 3. generate Prisma client
npx prisma generate

# 4. migrate DB (dev)
npx prisma migrate dev --name init

# 5. seed admin (optional)
npm run seed

# 6. start server (dev)
npm run dev
# server: http://localhost:5000, API root: /api/v1
```

---

## 5 — Local setup (frontend)

```bash
cd frontend
npm install
cp .env.example .env    # set REACT_APP_API_URL=http://localhost:5000/api/v1
npm start
# open http://localhost:3000
```

---

## 6 — Prisma migrations & seed (render / production)

On Render, either run migration in a deployment hook or run in shell:

```bash
npx prisma generate
npx prisma migrate deploy
# or for dev: npx prisma migrate dev --name init
# seed:
npm run seed
```

If you cannot run `migrate dev` on production DB, use `prisma migrate deploy` in CI or Render shell.

---

## 7 — Deployed verification commands (exact; use your token)

(These are the same commands from Section 1 but with the deployed URL.)

Health:

```bash
curl -s https://next-gen-crm-system-challenge.onrender.com/api/v1/ | jq
```

Register & login:

```bash
curl -s -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@local.test","password":"Admin@123","role":"ADMIN"}' | jq

curl -s -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.test","password":"Admin@123"}' | jq
```

Create lead:

```bash
TOKEN="PASTE_TOKEN"
curl -s -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/leads" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead 001","email":"lead001@example.com","phone":"9999999999","source":"Website","value":1500}' | jq
```

List leads & lead detail:

```bash
curl -s "https://next-gen-crm-system-challenge.onrender.com/api/v1/leads" | jq
curl -s "https://next-gen-crm-system-challenge.onrender.com/api/v1/leads/<LEAD_ID>" | jq
```

Analytics:

```bash
curl -s -H "Authorization: Bearer $TOKEN" "https://next-gen-crm-system-challenge.onrender.com/api/v1/analytics/leads-by-day?range=30" | jq
curl -s -H "Authorization: Bearer $TOKEN" "https://next-gen-crm-system-challenge.onrender.com/api/v1/analytics/conversion" | jq
```

---

## 8 — Integrations: Slack & HubSpot — setup checklist

### Slack (production)

1. Create Slack App → OAuth & Permissions → add `chat:write`, install to workspace → get **Bot User OAuth Token**.
2. In Slack App Basic Info → copy **Signing Secret**.
3. In Interactivity → set **Request URL** to:

```
https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/slack/actions
```

4. Invite bot to channel: in Slack, `/invite @YourBot` or add to channel.
5. In Render environment set:

```
SLACK_BOT_TOKEN=<bot_token>
SLACK_SIGNING_SECRET=<signing_secret>
SLACK_CHANNEL_ID=<channel_id>
```

6. Restart service.

### HubSpot (production)

1. Create HubSpot app → set Redirect URI to:

```
https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/callback
```

2. Add client ID/secret to Render env:

```
HUBSPOT_CLIENT_ID=...
HUBSPOT_CLIENT_SECRET=...
HUBSPOT_REDIRECT_URI=https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/callback
```

3. Restart service.
4. Visit `https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/connect` to start OAuth authorize flow.

**Note**: HubSpot webhook handling is implemented but you must configure subscriptions in HubSpot Developer settings to push events to:

```
https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/webhook
```

---

## 9 — Tests (Jest + pg-mem)

The project includes in-memory tests using `pg-mem`. Run:

```bash
npm test
```

This spins up an in-memory Postgres and runs Jest tests (Auth & Leads basic flow). Tests do not require your production DB.

---

## 10 — Docker (optional)

The repo contains `Dockerfile` for backend, frontend, and `docker-compose.yml`. Quick start (local):

```bash
docker-compose up --build
# Wait for DB container then run migrations inside backend container:
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed
```

---

## 11 — Troubleshooting & common fixes

* **`No Slack channel configured, skipping slack post.`**
  Set `SLACK_CHANNEL_ID` & `SLACK_BOT_TOKEN` in env and restart.

* **Signature validation fails for Slack actions**
  Ensure `SLACK_SIGNING_SECRET` in env exactly matches the app secret. Slack requires the raw request body — app captures raw body before parsers; do not change middleware order.

* **HubSpot OAuth fails**
  Verify that `HUBSPOT_REDIRECT_URI` in HubSpot app and env are identical (including `https`). Use a public URL (Render) not localhost.

* **Prisma migration errors**
  If migration conflicts in prod DB, use `npx prisma migrate deploy` in server shell or apply migrations in CI.

* **Emails are not delivered**
  If no SMTP configured, Ethereal is used by default and server logs an email preview URL. For production configure SMTP env vars.

* **Socket.io not delivering events to frontend**
  Check frontend points to `https://next-gen-crm-system-challenge.onrender.com` for Socket.io client and that CORS allows that origin.

---

## 12 — What I implemented (feature list)

* JWT auth + role-based access (Admin / Manager / Sales)
* Leads CRUD + ownership + auto-rotation assignment (DB-persistent)
* Activity timeline per lead (notes/calls/meetings/status changes)
* Socket.io realtime notifications (`notification:new_lead`, `notification:lead_updated`)
* Email notifications (nodemailer + Ethereal fallback)
* Slack Bot integration with interactive buttons and verified actions
* HubSpot OAuth + push of leads (contacts) and webhook receiver (basic lifecycle → lead status sync)
* Analytics endpoints + frontend charts (Chart.js)
* Frontend: React + Redux Toolkit + Tailwind, with pages for auth, dashboard, leads, lead detail, create lead, admin users, slack mapping
* Tests using Jest + pg-mem, Dockerization, and a README with verification steps

---

If you want, I will **generate a `README.md` file and push the exact content into your repo** (I can provide the raw Markdown here for you to paste) — ready to submit. I can also **produce a short submission checklist** (one-page) and a sample email/cover note to submit with the deployment link.

Which do you want next?

* A — Paste full `README.md` (ready to copy/paste into repo)
* B — Generate submission checklist + sample email text
* C — Both (README + checklist + email)
