Exactly 👍 — your seed script creates an **admin user** with either values from environment variables (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) or defaults (`admin@example.com` / `Admin@123`).  

**how to log in after seeding**.

---

## 🔑 Admin Login After Seeding

When you run the seed command inside Docker:

```bash
docker-compose exec backend npm run seed
```

an **admin user** is created in the database.

- If you set environment variables in `backend/.env`:
  ```env
  SEED_ADMIN_EMAIL=your-admin@example.com
  SEED_ADMIN_PASSWORD=YourSecurePassword123
  ```
  then those values will be used.

- If no environment variables are set, the defaults are:
  ```
  Email: admin@example.com
  Password: Admin@123
  ```

---

### 🖥️ How to Log In
- Open the frontend at [http://localhost:3000](http://localhost:3000)  
- Use the seeded admin credentials to log in:
  - **Email:** from `SEED_ADMIN_EMAIL` (or `admin@example.com` by default)  
  - **Password:** from `SEED_ADMIN_PASSWORD` (or `Admin@123` by default)  
---

# Next-Gen CRM System Challenge — Masters’ Union Assessment

**Developer:** Chandan Pandey
**Backend (Deployed):** [https://next-gen-crm-system-challenge.onrender.com/api/v1](https://next-gen-crm-system-challenge.onrender.com/api/v1)
**Tech Stack:** Node.js · Express · PostgreSQL · Prisma · Socket.io · React · Redux Toolkit · TailwindCSS
**Integrations:** Slack Bot + Interactive Buttons · HubSpot CRM Sync · Email Notifications

---

## 📌 Overview

This project implements a **modular, scalable CRM system** designed for fast-scaling startups.
It includes authentication, lead management, activity tracking, real-time updates, automated workflows, analytics dashboards, Slack integration, and optional HubSpot CRM synchronization.

The system is fully production-ready with a comprehensive backend, frontend, database schema, real-time functionality, automated lead assignment, and third-party integrations.

---

## 🚀 Features Implemented (Complete)

### 🔐 Authentication & Role Management

* JWT-based auth
* Roles: **Admin**, **Manager**, **Sales**
* RBAC-protected routes (Admin-only / Manager-only actions)

### 👥 Lead Management

* CRUD operations
* Ownership assignment
* **Auto-assignment via round-robin** (DB-persistent rotation)
* Source, status & value tracking

### 📝 Activity Timeline

* Notes
* Calls
* Meetings
* Status changes
* Auto-logged activities for Slack/HupSpot updates

### 🔔 Real-time Notifications

* WebSocket using Socket.io
* `notification:new_lead`
* `notification:lead_updated`
* Frontend updates instantly without refresh

### ✉ Email Notifications

* Sends email to lead owner
* Ethereal auto-preview in development
* SMTP-ready for production

### 📊 Dashboard & Analytics

* Leads by day (last 7/30 days)
* Conversion analytics (won/lost)
* Visualized using Chart.js

### 🤖 Slack Integration (COMPLETE)

* Bot posts interactive lead notifications
* Buttons: **Claim**, **Mark Won**, **Mark Lost**
* Verified with Slack Signing Secret
* Updates CRM instantly through actions endpoint
* Mapped Slack users to CRM users

**Slack Production URLs:**
Interactivity Request URL:

```
https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/slack/actions
```

### 🔗 HubSpot CRM Integration (COMPLETE)

* OAuth2 flow
* Token storage in DB
* Push new leads → HubSpot contacts
* Webhook receiver for CRM updates → syncs lead status

**HubSpot Redirect URL:**

```
https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/callback
```

---

## 🗂 Project Structure

```
backend/
  src/
    routes/
    services/
    integrations/
    utils/
    prismaClient.js
  prisma/schema.prisma

frontend/
  src/
    pages/
    components/
    store/
```

---

## 🔧 Environment Variables

### **Backend `.env`**

```
SEED_ADMIN_EMAIL=officialchandanpandey1@gmail.com
SEED_ADMIN_PASSWORD=Admin@123
DATABASE_URL="postgresql://nextgencrm_db_user:Bj40Gk5wUIiq0dVBK7w8QTyypmek6beS@dpg-d4arsve3jp1c73ebdfg0-a.oregon-postgres.render.com/nextgencrm_db?schema=public"

JWT_SECRET="replace_this_with_a_strong_secret"
PORT=5000

# Optional SMTP for production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=officialchandanpandey1@gmail.com
SMTP_PASS=hxwpzeoqffvwrbdg   
SMTP_SECURE=false
MAIL_FROM="Abc@123456789 <officialchandanpandey1@gmail.com>"


# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your.email@gmail.com
# SMTP_PASS=xxxxxxxxxxxxxxxx  # the 16-char App Password from Google
# SMTP_SECURE=false           # true if using 465, false for 587 (STARTTLS)
# MAIL_FROM="NextGen CRM <no-reply@yourdomain.com>"


# Slack integration (Incoming Webhook URL)
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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

# Slack integration (Incoming Webhook URL)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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
SLACK_BOT_TOKEN=xoxb-9927016121121-9912111186038-igrfcQC9ValK0psXTFeTQKRU
SLACK_SIGNING_SECRET=e05daba7df3f104e209247f38f1f0fb8
SLACK_ACTIONS_URL=https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/slack/actions
SLACK_CHANNEL_ID=C09SEKHNNQ7
# HubSpot webhook endpoint (optional)
HUBSPOT_WEBHOOK_URL=https://next-gen-crm-system-challenge.onrender.com/webhooks/hubspot

# HubSpot
HUBSPOT_ENABLE=true
HUBSPOT_PRIVATE_APP_TOKEN=pat-na2-96e92649-9823-41e7-81b4-f7832a20a3f7

HUBSPOT_CLIENT_ID=803d8206-083f-4b55-95ec-9a4708ca0c15
HUBSPOT_CLIENT_SECRET=ab17982e-1eda-43fa-a9f0-c4161b0e577f
# HUBSPOT_REDIRECT_URI=http://localhost:5000/api/v1/integrations/hubspot/callback
HUBSPOT_REDIRECT_URI=https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/callback
HUBSPOT_SCOPES=contacts
HUBSPOT_ENABLE=true
# Enable auto rotation 
AUTO_ASSIGN_ROTATION=true
# HUBSPOT_REDIRECT_URI=https://your-public-domain.com/api/v1/integrations/hubspot/callback

```

---

## 🧪 Verification Commands (curl)

### Register Admin

```bash
curl -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"Admin@123","role":"ADMIN"}'
```

### Login

```bash
curl -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin@123"}'
```

### Create Lead

```bash
curl -X POST "https://next-gen-crm-system-challenge.onrender.com/api/v1/leads" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"lead@test.com","phone":"999999","value":1000,"source":"Website"}'
```

### Analytics

```bash
curl "https://next-gen-crm-system-challenge.onrender.com/api/v1/analytics/leads-by-day?range=30"
curl "https://next-gen-crm-system-challenge.onrender.com/api/v1/analytics/conversion"
```

---

## 🔌 Slack Setup

1. Create Slack App
2. Enable **Interactivity**
3. Set Request URL:
   `https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/slack/actions`
4. Add scope `chat:write`
5. Install to workspace
6. Add bot to channel
7. Set env vars on Render
8. Restart service

---

## 🔌 HubSpot Setup

1. Create HubSpot Developer App
2. Redirect URI:
   `https://next-gen-crm-system-challenge.onrender.com/api/v1/integrations/hubspot/callback`
3. Add scopes: `contacts`
4. Start OAuth:
   `/api/v1/integrations/hubspot/connect`

---

## 🎯 Completed Requirements Checklist

| Requirement             | Status     |
| ----------------------- | ---------- |
| Auth + RBAC             | ✅ Complete |
| Leads CRUD              | ✅ Complete |
| Activity Timeline       | ✅ Complete |
| Real-time notifications | ✅ Complete |
| Email automation        | ✅ Complete |
| Slack Bot Integration   | ✅ Complete |
| HubSpot Integration     | ✅ Complete |
| Analytics & Dashboard   | ✅ Complete |
| Testing (Jest + pgmem)  | ✅ Complete |
| Deployment (Render)     | ✅ Complete |
| README, Docs            | ✅ Complete |

---

## 🧪 Tests

```
npm test
```

---

## 🚀 Running Locally

Backend:

```
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Frontend:

```
cd frontend
npm install
npm start
```

---

## 📝 Author

**Chandan Pandey**
Masters’ Union — Next-Gen CRM Challenge Submission
2025

---

# ✅ PART 2 — SUBMISSION CHECKLIST (use before submitting)

### ✔ **Backend deployed & reachable**

* [https://next-gen-crm-system-challenge.onrender.com/api/v1](https://next-gen-crm-system-challenge.onrender.com/api/v1) returns `{ ok: true }`

### ✔ **Auth working**

* Register + login returns JWT
* `/auth/me` returns correct user info

### ✔ **Leads working**

* Create lead
* List leads
* Owner assigned correctly (auto-rotation)

### ✔ **Activities working**

* Add activity to lead
* Lead detail shows timeline

### ✔ **WebSockets working**

* `notification:new_lead` emitted
* Frontend updates automatically

### ✔ **Emails working**

* Ethereal preview URL prints in server logs
* Or SMTP email delivered

### ✔ **Slack integration working**

* Lead creation posts Slack message
* Buttons (Claim / Won / Lost) update lead
* No signature mismatch

### ✔ **HubSpot integration (optional)**

* OAuth connect works
* Lead pushed to HubSpot
* Webhook updates status

### ✔ **README added to repository**

---

# ✅ PART 3 — PROFESSIONAL SUBMISSION EMAIL

Here is a polished email/message you can send to Masters’ Union / recruiter:

---

**Subject:** Submission – Next-Gen CRM System Challenge – Chandan Pandey

Dear Team,

I hope you are doing well.

I am submitting my completed assignment for the **Next-Gen CRM System Challenge**.
This project has been fully implemented and deployed, including authentication, RBAC, lead management, activity tracking, real-time updates, automated emails, Slack integration, HubSpot integration, analytics dashboard, and complete documentation.

**Deployed Backend:**
[https://next-gen-crm-system-challenge.onrender.com/api/v1](https://next-gen-crm-system-challenge.onrender.com/api/v1)

**GitHub Repository:**
https://github.com/dev-chandan-pandey/Next-Gen-CRM-System-Challenge/tree/main/backend

I have also included a comprehensive README with setup instructions, API documentation, integration steps, and verification commands.

Please let me know if you would like a quick walkthrough or demo—I’d be happy to explain the architecture and implementation decisions.

Thank you for the opportunity,
**Chandan Pandey**

---

## ⚙️ Database Reset & Migrations (Docker)

When running the backend inside Docker, Prisma commands must be executed **inside the backend container**. Follow these steps:

### 1. Start Containers
```bash
docker-compose up --build
```

This will start the `db`, `backend`, and `frontend` services.

---

### 2. Run Migrations
Apply migrations inside the backend container:

```bash
docker-compose exec backend npx prisma migrate deploy
```

If you’re still developing and want to reset completely:

```bash
docker-compose exec backend npx prisma migrate reset --force
```

---

### 3. Seed Database
Run the seed script inside the backend container:

```bash
docker-compose exec backend npm run seed
```

---

### 4. Open a Shell Inside Backend (Optional)
If you want to run multiple commands interactively:

```bash
docker-compose exec backend sh
```

Then inside the container you can run:
```bash
npx prisma migrate reset --force
npm run seed
```

---

### 5. Connect Directly to Postgres (Optional)
To connect to the database container:

```bash
docker-compose exec db psql -U postgres -d nextgencrm
```

---

✅ With these commands, you can reset, migrate, and seed your database entirely inside Docker without touching your local environment.

---
Perfect — since you want to **use only Docker** and run all Prisma commands inside the container, here’s a complete **README section** you can copy‑paste. It explains both how to **enter the backend container** and how to run your scripts (`reset`, `migrate`, `generate`, `seed`) using Docker.

---

# 🚀 Quick Start (Docker Only)

This project runs entirely inside Docker using **Docker Compose**.  
Services:
- **db** → Postgres database  
- **backend** → Express + Prisma API  
- **frontend** → React app served via Nginx  

---

## 1. Start Containers
```bash
docker-compose up --build
```

This will start all services:
- Database on port **5432**
- Backend API on port **5000**
- Frontend on port **3000**

---

## 2. Enter Backend Container
To run commands inside the backend container, open a shell:

```bash
docker-compose exec backend sh
```

Now you are inside the container. You can run any npm script defined in `package.json`.

---

## 3. Database Management (Prisma)

Scripts available in `package.json`:

```json
"scripts": {
  "prisma:reset": "npx prisma migrate reset",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev --name init",
  "seed": "node prisma/seed.js",
  "dev": "nodemon src/server.js --watch src",
  "start": "node src/server.js",
  "test": "jest --runInBand"
}
```

### Run Migrations
```bash
docker-compose exec backend npm run prisma:migrate
```

### Reset Database
```bash
docker-compose exec backend npm run prisma:reset -- --force
```

### Generate Prisma Client
```bash
docker-compose exec backend npm run prisma:generate
```

### Seed Database
```bash
docker-compose exec backend npm run seed
```

---

## 4. One‑liner Quick Reset (Reset + Seed)
For convenience, you can run reset and seed together:

```bash
docker-compose exec backend sh -c "npm run prisma:reset -- --force && npm run seed"
```

---

## 5. Access the App
- Frontend → [http://localhost:3000](http://localhost:3000)  
- Backend API → [http://localhost:5000](http://localhost:5000)  

---

✅ With these commands, you can manage **Prisma migrations, resets, and seeding entirely inside Docker**. No local setup required — everything runs inside containers.

---


