# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zalo OA chatbot + admin system for UBND phường An Hải. Citizens send feedback via Zalo; staff manage it through a web dashboard.

## Commands

### Backend (Backend/)
```bash
cd Backend
npm run dev        # nodemon server.js — port 3001
npm start          # node server.js
```

### React Admin Dashboard (Frontend/Web/)
```bash
cd Frontend/Web
npm run dev        # Vite dev server — port 5173, proxies /api → localhost:3001
npm run build      # Output to Frontend/Web/dist/ (served by Express in production)
npm run lint       # ESLint
```

### Utility scripts (run from Backend/)
```bash
cd Backend
node setup-menu.js     # Cài đặt menu Zalo OA (yêu cầu ZALO_OA_TOKEN trong .env)
node update-webhook.js # Cập nhật webhook URL lên Zalo
```

## Architecture

### Request flow

```
Citizen (Zalo) → Zalo webhook POST /webhook
                    └→ Backend/src/handlers/webhookHandler.js
                         └→ Backend/src/services/feedbackService.js (state machine in memory)
                              └→ Backend/src/utils/zaloApi.js (Zalo OA API)
                              └→ Backend/src/utils/cloudinary.js (image upload)
                              └→ Backend/src/models/Feedback.js (MongoDB)

Admin (browser) → Frontend/Web/ (React SPA, Vercel)
                    └→ GET|POST /api/* (JWT Bearer)
                         └→ Backend/api/routes/*.js
                              └→ Backend/src/models/*.js (MongoDB)
                              └→ Backend/src/utils/zaloApi.js (send replies)
```

### Directory structure

```
/
├── Backend/      # Express + MongoDB — toàn bộ logic server
├── Frontend/Web/ # React 19 + Vite + Tailwind — admin dashboard
└── Document/     # Tài liệu phụ (DEPLOY.md, quy trình)
```

| Path | Purpose |
|------|---------|
| `Backend/server.js` | Express entry point; mounts `/webhook`, `/api`, `/admin`, serves `Frontend/Web/dist` |
| `Backend/src/config/index.js` | Single CONFIG object — all env vars with fallbacks |
| `Backend/src/handlers/webhookHandler.js` | Routes Zalo events to feedbackService |
| `Backend/src/services/feedbackService.js` | In-memory state machine for citizen feedback flow |
| `Backend/src/utils/zaloToken.js` | Token lifecycle: reads from Redis on boot, auto-refreshes |
| `Backend/src/utils/zaloApi.js` | Wraps all Zalo OA API calls; handles token expiry (-216) |
| `Backend/src/utils/cloudinary.js` | Upload images from URL or Zalo CDN buffer |
| `Backend/src/models/` | Mongoose schemas: Feedback, AdminUser, Category, ZaloGroupMember |
| `Backend/api/routes/` | REST API for React frontend — auth, feedbacks, users, categories, stats, broadcast |
| `Backend/api/middleware/requireAuth.js` | Accepts JWT (React) **or** session cookie (EJS) |
| `Backend/api/middleware/requireRole.js` | Role-based guard: superadmin / dept_leader / officer |
| `Backend/admin/` | Legacy EJS admin panel at `/admin/*` (session auth, still functional) |
| `Frontend/Web/` | React 19 + Vite + Tailwind + React Query — main admin dashboard |

### Two admin systems

1. **`Backend/admin/` (EJS)** — server-side rendered, session auth, at `/admin` route. Legacy but functional.
2. **`Frontend/Web/` (React SPA)** — JWT auth, calls `/api/*`, deployed to Vercel; served from `/app/*` when `Frontend/Web/dist/` exists. Includes the broadcast/messages feature (superadmin only at `/messages`).

### Authentication dual-mode

`Backend/api/middleware/requireAuth.js` checks **JWT first** (Authorization: Bearer), then falls back to **express-session**. This lets React and EJS use the same API routes.

### Zalo token lifecycle

`Backend/src/utils/zaloToken.js` is a self-contained module:
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

`.env` sống ở `Backend/.env` (không phải root).

| Variable | Used by |
|----------|---------|
| `MONGO_URI` | `Backend/server.js` (mongoose.connect via CONFIG) |
| `ZALO_OA_TOKEN` / `ZALO_REFRESH_TOKEN` | `Backend/src/utils/zaloToken.js` (seed value; Redis takes over after first run) |
| `ZALO_APP_ID` / `ZALO_APP_SECRET` | `Backend/src/utils/zaloToken.js` (refresh grant) |
| `ZALO_GROUP_ID` | `Backend/src/utils/zaloApi.js` (default group fallback) |
| `UPSTASH_REDIS_REST_URL/TOKEN` | `Backend/src/utils/zaloToken.js` (token persistence) |
| `CLOUDINARY_*` | `Backend/src/utils/cloudinary.js` |
| `JWT_SECRET` | `Backend/api/routes/auth.js`, `Backend/api/middleware/requireAuth.js` |
| `SESSION_SECRET` | `Backend/server.js` express-session |
| `ADMIN_PASSWORD` | `Backend/src/admin/auth.js` (legacy EJS login) |
| `PUBLIC_URL` | `Backend/api/routes/broadcast.js` (video URL generation) |
| `PORT` | `Backend/server.js` / `Backend/src/config/index.js` (default 3001) |

### Data models

**Feedback** — core document; `status` enum: `pending | draft | resolved` (also legacy `processing | done`). Fields track the full lifecycle: `assignedTo`, `draftResponse/draftBy/draftAt`, `finalResponse/approvedBy/sentAt`, `rejectedReason`.

**AdminUser** — `role` enum: `superadmin | dept_leader | officer | staff`. `categoryIds` scopes dept_leader and officer to specific feedback categories. `zaloUserId` enables @mention in group notifications and OTP password reset.

**Category** — maps feedback type to a Zalo group (`zaloGroupId`). The 4 default categories are seeded on first MongoDB connection.

### Production deployment

- **Backend**: VPS (Bitzfly) — PM2 process `anhai-backend` runs `Backend/server.js` with `--cwd Backend`; deployed automatically via `.github/workflows/deploy.yml` on push to `main`. Xem `Document/DEPLOY.md` cho playbook đầy đủ (SSH, Nginx, SSL, CI/CD).
- **Web frontend**: Vercel (Root Directory = `Frontend/Web`, `Frontend/Web/vercel.json`) — SPA rewrite to index.html; sets `VITE_API_URL` to the VPS domain.

### Key dev quirks

- `Frontend/Web/dist/` is served by Express at `/app*` when it exists; in dev, run both `cd Backend && npm run dev` and `cd Frontend/Web && npm run dev` simultaneously.
- Zalo tokens in `Backend/.env` are only the initial seed; once Redis has tokens they take precedence. After any redeployment, either re-run OAuth at `/` or POST to `/admin/set-tokens`.
- Broadcast API (`/api/broadcast/*`) requires `superadmin` role — all upload endpoints use multer with diskStorage to `Backend/public/images/`; files are unlinked after upload to Zalo.
- `pm2 restart` không đổi lại script path/cwd nếu vị trí file đã thay đổi — deploy.yml dùng `pm2 delete` + `pm2 start ... --cwd Backend` để tránh chạy nhầm config cũ.
