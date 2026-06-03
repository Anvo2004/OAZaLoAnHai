# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zalo OA chatbot + admin system for UBND phường An Hải. Citizens send feedback via Zalo; staff manage it through a web dashboard.

## Commands

### Backend (root)
```bash
npm run dev        # nodemon server.js — port 3001
npm start          # node server.js
```

### React Admin Dashboard (Web/)
```bash
cd Web
npm run dev        # Vite dev server — port 5173, proxies /api → localhost:3001
npm run build      # Output to Web/dist/ (served by Express in production)
npm run lint       # ESLint
```

### Zalo Message Tool (admin-ui/)
```bash
cd admin-ui
npm run dev        # Vite dev server — port 5173, proxies /admin → localhost:3000
                   # ⚠️ Mismatch: server runs on 3001, change target in admin-ui/vite.config.js
npm run build      # Output to admin-ui/dist/
```

### Utility scripts (run from root)
```bash
node setup-menu.js     # Cài đặt menu Zalo OA (yêu cầu ZALO_OA_TOKEN trong .env)
node update-webhook.js # Cập nhật webhook URL lên Zalo
```

## Architecture

### Request flow

```
Citizen (Zalo) → Zalo webhook POST /webhook
                    └→ src/handlers/webhookHandler.js
                         └→ src/services/feedbackService.js (state machine in memory)
                              └→ src/utils/zaloApi.js (Zalo OA API)
                              └→ src/utils/cloudinary.js (image upload)
                              └→ src/models/Feedback.js (MongoDB)

Admin (browser) → Web/ (React SPA, Vercel)
                    └→ GET|POST /api/* (JWT Bearer)
                         └→ api/routes/*.js
                              └→ src/models/*.js (MongoDB)
                              └→ src/utils/zaloApi.js (send replies)
```

### Directory structure

| Path | Purpose |
|------|---------|
| `server.js` | Express entry point; mounts `/webhook`, `/api`, `/admin`, serves `Web/dist` |
| `src/config/index.js` | Single CONFIG object — all env vars with fallbacks |
| `src/handlers/webhookHandler.js` | Routes Zalo events to feedbackService |
| `src/services/feedbackService.js` | In-memory state machine for citizen feedback flow |
| `src/utils/zaloToken.js` | Token lifecycle: reads from Redis on boot, auto-refreshes |
| `src/utils/zaloApi.js` | Wraps all Zalo OA API calls; handles token expiry (-216) |
| `src/utils/cloudinary.js` | Upload images from URL or Zalo CDN buffer |
| `src/models/` | Mongoose schemas: Feedback, AdminUser, Category, ZaloGroupMember |
| `api/routes/` | REST API for React frontend — auth, feedbacks, users, categories, stats, broadcast |
| `api/middleware/requireAuth.js` | Accepts JWT (React) **or** session cookie (EJS) |
| `api/middleware/requireRole.js` | Role-based guard: superadmin / dept_leader / officer |
| `admin/` | Legacy EJS admin panel at `/admin/*` (session auth, still functional) |
| `admin-ui/` | Standalone vanilla-JS broadcast tool (separate Vite app, own auth flow) |
| `Web/` | React 19 + Vite + Tailwind + React Query — main admin dashboard |

### Two admin systems

1. **`admin/` (EJS)** — server-side rendered, session auth, at `/admin` route. Legacy but functional.
2. **`Web/` (React SPA)** — JWT auth, calls `/api/*`, deployed to Vercel; served from `/app/*` when `Web/dist/` exists. Includes the broadcast/messages feature (superadmin only at `/messages`).

### Authentication dual-mode

`api/middleware/requireAuth.js` checks **JWT first** (Authorization: Bearer), then falls back to **express-session**. This lets React and EJS use the same API routes.

### Zalo token lifecycle

`src/utils/zaloToken.js` is a self-contained module:
- On startup: reads tokens from Upstash Redis → immediately calls `refreshAccessToken()`
- Schedules proactive refresh ~25 hours before expiry (token TTL = 90,000s)
- If Zalo returns error `-216` (expired), `zaloApi.js` retries with a fresh token
- Manual override: POST to `/admin/set-tokens` or visit the OAuth callback at `/`

### Feedback workflow (3-step approval)

```
pending → [officer writes draft] → draft → [leader approves] → resolved (sent to citizen)
                                         → [leader rejects]  → pending (back to officer)
```

Zalo group notifications are sent at each transition; `@mention` is included when `AdminUser.zaloUserId` is set.

### Role permissions

| Role | Can do |
|------|--------|
| `superadmin` | Full access; manage all users, categories, feedbacks |
| `dept_leader` | Manage feedbacks in their `categoryIds`; approve/reject drafts |
| `officer` / `staff` | See assigned feedbacks only; write drafts |

### Env vars and their consumers

| Variable | Used by |
|----------|---------|
| `MONGO_URI` | `server.js` (mongoose.connect via CONFIG) |
| `ZALO_OA_TOKEN` / `ZALO_REFRESH_TOKEN` | `src/utils/zaloToken.js` (seed value; Redis takes over after first run) |
| `ZALO_APP_ID` / `ZALO_APP_SECRET` | `src/utils/zaloToken.js` (refresh grant) |
| `ZALO_GROUP_ID` | `src/utils/zaloApi.js` (default group fallback) |
| `UPSTASH_REDIS_REST_URL/TOKEN` | `src/utils/zaloToken.js` (token persistence) |
| `CLOUDINARY_*` | `src/utils/cloudinary.js` |
| `JWT_SECRET` | `api/routes/auth.js`, `api/middleware/requireAuth.js` |
| `SESSION_SECRET` | `server.js` express-session |
| `ADMIN_PASSWORD` | `src/admin/auth.js` (legacy EJS + admin-ui login) |
| `PUBLIC_URL` | `src/routes/adminRoutes.js` (video URL generation) |
| `PORT` | `server.js` / `src/config/index.js` (default 3001) |

### Data models

**Feedback** — core document; `status` enum: `pending | draft | resolved` (also legacy `processing | done`). Fields track the full lifecycle: `assignedTo`, `draftResponse/draftBy/draftAt`, `finalResponse/approvedBy/sentAt`, `rejectedReason`.

**AdminUser** — `role` enum: `superadmin | dept_leader | officer | staff`. `categoryIds` scopes dept_leader and officer to specific feedback categories. `zaloUserId` enables @mention in group notifications and OTP password reset.

**Category** — maps feedback type to a Zalo group (`zaloGroupId`). The 4 default categories are seeded on first MongoDB connection.

### Production deployment

- **Backend**: Render (render.yaml) — `node server.js`, PORT=10000
- **Web frontend**: Vercel (Web/vercel.json) — SPA rewrite to index.html; sets `VITE_API_URL` to Render URL if needed
- **admin-ui**: Not yet deployed; currently dev-only

### Key dev quirks

- `Web/dist/` is served by Express at `/app*` when it exists; in dev, run both `npm run dev` (backend) and `cd Web && npm run dev` simultaneously.
- Zalo tokens in `.env` are only the initial seed; once Redis has tokens they take precedence. After any redeployment, either re-run OAuth at `/` or POST to `/admin/set-tokens`.
- Broadcast API (`/api/broadcast/*`) requires `superadmin` role — all upload endpoints use multer with diskStorage to `public/images/`; files are unlinked after upload to Zalo.
