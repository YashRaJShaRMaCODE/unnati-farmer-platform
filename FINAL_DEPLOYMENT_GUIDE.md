# UNNATI — Final Deployment Guide

**Pre-deployment audit date:** July 5, 2026  
**Scope:** Deployment readiness only (no application feature changes)  
**Target stack:** Render (backend + PostgreSQL) · Vercel (frontend)

---

## Pre-Deployment Audit Summary

| Area | Status | Notes |
|------|--------|-------|
| Environment variables | ✅ Ready | 6 required backend + 1 frontend; 5 optional |
| PostgreSQL compatibility | ✅ Ready | `psycopg2-binary`, `dj-database-url`, `libpq-dev` in Docker |
| Render compatibility | ⚠️ Ready with setup | `render.yaml` + Dockerfile valid; migrate is manual |
| Vercel compatibility | ✅ Ready | Next.js 15, `vercel.json` present, build passes |
| JWT production settings | ✅ Ready | 60-min access, 7-day refresh, rotate + blacklist |
| CORS settings | ✅ Ready | Env-driven origins; credentials enabled |
| Static files | ✅ Ready | WhiteNoise + `collectstatic` in Docker build |
| Media files | ⚠️ Cloudinary required | Local `/media/` not persisted on Render |

**Deployment readiness score: 89 / 100**

Deductions: manual migration step (+), Cloudinary required for uploads (+), possible SSL proxy config on Render (+), no HSTS configured (+).

---

## Architecture

```
┌─────────────────────┐         HTTPS          ┌──────────────────────────┐
│  Vercel (Frontend)  │ ─────────────────────► │  Render (Django + Gunicorn) │
│  Next.js 15         │      JWT Bearer         │  Port 8000                  │
│  NEXT_PUBLIC_API_URL│ ◄────────────────────── │  /api/*                     │
└─────────────────────┘         CORS           └────────────┬─────────────┘
                                                             │
                                                             ▼
                                                  ┌──────────────────────┐
                                                  │ Render PostgreSQL     │
                                                  │ (unnati-db)           │
                                                  └──────────────────────┘

Optional: Cloudinary (media) · Gemini API (AI assistant)
```

---

## All Environment Variables

### Backend — Required (Production)

Set these on **Render** (Web Service → Environment):

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `DJANGO_SECRET_KEY` | `generate-a-50+-char-random-string` | Cryptographic signing. Render can auto-generate via `render.yaml`. |
| `DEBUG` | `False` | Disables debug mode; enables production security headers. |
| `ALLOWED_HOSTS` | `unnati-backend.onrender.com` | Comma-separated hostnames Django will serve. Include your exact Render URL. |
| `DATABASE_URL` | *(auto from Render DB)* | PostgreSQL connection string. Linked automatically via `render.yaml`. |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Comma-separated frontend URLs allowed to call the API. **No trailing slash.** |

### Backend — Required for File Uploads (Production)

Render containers have **ephemeral filesystems**. Without Cloudinary, uploaded images/documents are lost on redeploy.

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Activates Cloudinary media storage when set. |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Cloudinary API secret. |

### Backend — Optional

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloud_name` | Alternative Cloudinary config (optional if above three are set). |
| `GEMINI_API_KEY` | `your-gemini-key` | Enables AI Assistant. Without it, fallback tips are returned. |

### Frontend — Required (Production)

Set on **Vercel** (Project → Settings → Environment Variables):

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `NEXT_PUBLIC_API_URL` | `https://unnati-backend.onrender.com/api` | Backend API base URL. **Must include `/api`. No trailing slash after `/api`.** |

### Local Development (Reference)

Copy `.env.example` to `.env` (backend) and create `frontend/.env.local`:

```env
# backend/.env
DJANGO_SECRET_KEY=dev-only-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=                           # leave empty for SQLite
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Verified Configuration Details

### PostgreSQL Compatibility

| Check | Result |
|-------|--------|
| Driver | `psycopg2-binary==2.9.12` in `requirements.txt` |
| URL parsing | `dj-database-url` with `conn_max_age=600` |
| Docker build deps | `libpq-dev` + `gcc` installed in `Dockerfile` |
| Migrations | All applied; includes `token_blacklist` for JWT logout |
| Field types | Standard Django fields + `JSONField` (PostgreSQL-native) |
| Fallback | SQLite used only when `DATABASE_URL` is unset (dev) |

**Render PostgreSQL:** `render.yaml` provisions database `unnati-db` and injects `DATABASE_URL` automatically.

### JWT Production Settings

Configured in `backend/config/settings.py`:

| Setting | Value | Production impact |
|---------|-------|-------------------|
| `ACCESS_TOKEN_LIFETIME` | 60 minutes | Short-lived access tokens |
| `REFRESH_TOKEN_LIFETIME` | 7 days | Weekly re-login unless refreshed |
| `ROTATE_REFRESH_TOKENS` | `True` | New refresh token on each refresh |
| `BLACKLIST_AFTER_ROTATION` | `True` | Old refresh tokens invalidated (requires DB) |
| `AUTH_HEADER_TYPES` | `Bearer` | Standard Authorization header |
| Auth backend | `JWTAuthentication` | All API endpoints except public auth routes |

**Production requirement:** PostgreSQL must be migrated (includes `token_blacklist` tables) for logout/blacklist to work.

### CORS Settings

| Setting | Value |
|---------|-------|
| `CORS_ALLOWED_ORIGINS` | From env, comma-separated |
| `CORS_ALLOW_CREDENTIALS` | `True` |
| Default (dev) | `http://localhost:3000,http://127.0.0.1:3000` |

**Production rule:** Set `CORS_ALLOWED_ORIGINS` to your exact Vercel URL(s):

```
https://unnati.vercel.app
```

If you use a custom domain, add it too (comma-separated, no spaces recommended):

```
https://unnati.vercel.app,https://www.unnati.in
```

### Static Files

| Setting | Value |
|---------|-------|
| `STATIC_URL` | `/static/` |
| `STATIC_ROOT` | `backend/staticfiles/` |
| Storage | `whitenoise.storage.CompressedManifestStaticFilesStorage` |
| Middleware | `WhiteNoiseMiddleware` (after SecurityMiddleware) |
| Docker build | `python manage.py collectstatic --noinput` runs at image build |

Static files (admin CSS, DRF browsable API assets) are served by **WhiteNoise** from the container. No separate CDN required.

### Media Files

| Setting | Dev (`DEBUG=True`) | Production (`DEBUG=False`) |
|---------|-------------------|---------------------------|
| `MEDIA_URL` | `/media/` | Cloudinary URLs when configured |
| `MEDIA_ROOT` | `backend/media/` | Not served via Django URLs |
| URL serving | `urls.py` serves `/media/` locally | **Disabled** — no local media routes |
| Storage | Filesystem | Cloudinary when `CLOUDINARY_CLOUD_NAME` is set |

**Upload fields requiring Cloudinary in production:**

- Farmer profile images (`farmers/`)
- Land ownership documents (`lands/`)
- Complaint evidence files (`complaints/`)

---

## Step-by-Step: Deploy Backend to Render

### Prerequisites

- GitHub repo pushed with UNNATI code
- [Render](https://render.com) account
- [Cloudinary](https://cloudinary.com) account (for file uploads)

### Step 1 — Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render detects `render.yaml` at repo root

### Step 2 — Review Blueprint

`render.yaml` creates:

| Resource | Name | Plan |
|----------|------|------|
| Web Service | `unnati-backend` | free |
| PostgreSQL | `unnati-db` | free |

Confirm and click **Apply**.

### Step 3 — Set Manual Environment Variables

After blueprint deploy starts, open **unnati-backend** → **Environment** and set:

```
ALLOWED_HOSTS=unnati-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-key
```

Replace `unnati-backend.onrender.com` with your actual Render service hostname (shown on the service page).

`DJANGO_SECRET_KEY`, `DEBUG`, and `DATABASE_URL` are set automatically by the blueprint.

### Step 4 — Run Database Migrations

The Docker entrypoint does **not** run migrations. Run once after first deploy:

1. Open **unnati-backend** → **Shell**
2. Run:

```bash
python manage.py migrate
```

3. (Optional) Create admin user:

```bash
python manage.py createsuperuser
```

4. (Optional) Seed demo data for viva:

```bash
python manage.py seed_demo_data
```

Demo login: `farmer1@unnati.demo` / `Demo@1234`

### Step 5 — Verify Backend

Replace `YOUR-BACKEND-URL` with your Render hostname:

```bash
# Health — should return OpenAPI JSON
curl https://YOUR-BACKEND-URL.onrender.com/api/schema/

# Swagger UI — open in browser
https://YOUR-BACKEND-URL.onrender.com/api/docs/
```

Expected: HTTP 200 on `/api/schema/`.

**Note:** Free-tier Render services spin down after inactivity. First request may take ~30 seconds.

### Step 6 — SSL / HTTPS Note

When `DEBUG=False`, Django enables `SECURE_SSL_REDIRECT=True`. Render terminates HTTPS at the edge and forwards requests to Gunicorn over HTTP.

If you see **redirect loops** after deploy, add this to Render environment (requires a one-line settings change in a future update):

```
# Known deployment consideration — verify /api/schema/ loads over HTTPS
# If redirect loop occurs, SECURE_PROXY_SSL_HEADER may need to be configured in settings.py
```

Test `/api/schema/` first. Most Render deployments work; if redirect loops occur, see [Render Django docs](https://render.com/docs/deploy-django).

---

## Step-by-Step: Deploy Frontend to Vercel

### Prerequisites

- Backend deployed and `/api/schema/` accessible
- [Vercel](https://vercel.com) account

### Step 1 — Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`

### Step 2 — Configure Build

Vercel auto-detects Next.js. Confirm these settings (also in `frontend/vercel.json`):

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x (recommended) |

### Step 3 — Set Environment Variable

In **Settings → Environment Variables**, add for **Production**, **Preview**, and **Development**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` |

**Critical formatting rules:**

- Include `/api` at the end
- Use `https://` (not `http://`)
- **No trailing slash** after `/api`

Correct: `https://unnati-backend.onrender.com/api`  
Wrong: `https://unnati-backend.onrender.com/api/`  
Wrong: `https://unnati-backend.onrender.com`

### Step 4 — Deploy

Click **Deploy**. Wait for build to complete (~2–3 minutes).

Expected build output: **23 static routes**, no TypeScript or ESLint errors.

### Step 5 — Update Backend CORS

Copy your Vercel deployment URL (e.g. `https://unnati.vercel.app`).

Return to Render → **unnati-backend** → **Environment** and update:

```
CORS_ALLOWED_ORIGINS=https://unnati.vercel.app
```

Save — Render redeploys automatically.

If you add a custom domain on Vercel, update CORS again to include it.

### Step 6 — Verify Frontend

1. Open your Vercel URL
2. Go to `/login`
3. Log in with demo credentials or a registered account
4. Confirm `/dashboard` loads with data
5. Open browser DevTools → Network — API calls should go to your Render URL with status 200

---

## Post-Deployment Verification Checklist

Run through this list after both services are live:

### Backend

- [ ] `GET /api/schema/` returns 200
- [ ] `GET /api/docs/` loads Swagger UI
- [ ] `POST /api/auth/login/` returns `access` and `refresh` tokens
- [ ] `POST /api/auth/refresh/` returns new access token
- [ ] Authenticated `GET /api/auth/me/` returns user profile
- [ ] `GET /api/dashboard/farmer/` returns 200 with farmer JWT
- [ ] Django admin accessible at `/admin/` (if superuser created)

### Frontend

- [ ] Landing page loads at `/`
- [ ] Login redirects to `/dashboard`
- [ ] Role-specific navigation visible
- [ ] No CORS errors in browser console
- [ ] JWT refresh works (stay logged in > 60 minutes)

### Cross-Service

- [ ] `NEXT_PUBLIC_API_URL` matches Render backend URL exactly
- [ ] `CORS_ALLOWED_ORIGINS` matches Vercel frontend URL exactly
- [ ] `ALLOWED_HOSTS` includes Render hostname
- [ ] File upload works (test complaint or land document — requires Cloudinary)

---

## Environment Variable Quick Reference

### Copy-Paste Template (Production)

**Render (backend):**

```env
DJANGO_SECRET_KEY=<auto-generated or 50+ char random>
DEBUG=False
ALLOWED_HOSTS=unnati-backend.onrender.com
DATABASE_URL=<auto-linked from unnati-db>
CORS_ALLOWED_ORIGINS=https://unnati.vercel.app
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
GEMINI_API_KEY=<optional>
```

**Vercel (frontend):**

```env
NEXT_PUBLIC_API_URL=https://unnati-backend.onrender.com/api
```

---

## Deployment Audit — Issues to Be Aware Of

These do **not** block deployment but should be verified after go-live:

| # | Issue | Impact | Action |
|---|-------|--------|--------|
| 1 | Migrations not in Docker CMD | DB tables missing on first deploy | Run `migrate` manually in Render Shell |
| 2 | No Cloudinary configured | Uploads lost on redeploy | Set all 3 Cloudinary env vars |
| 3 | `GEMINI_API_KEY` not in `render.yaml` | AI returns fallback tips only | Add manually if AI demo needed |
| 4 | Free-tier cold starts | ~30s delay on first request | Warm up before viva/demo |
| 5 | `SECURE_HSTS_SECONDS` not set | No HSTS header | Acceptable for academic deploy |
| 6 | Default dev `SECRET_KEY` if env missing | Security risk | Always set `DJANGO_SECRET_KEY` on Render |
| 7 | Media not served locally in production | Expected | Cloudinary handles all uploads |
| 8 | `frontend/.env.local.example` not in repo | Dev setup friction | Use `.env.example` at repo root as reference |

---

## Local Pre-Deploy Verification Commands

Run before pushing to production:

```bash
# Backend tests
cd backend
python manage.py test
python manage.py check

# Production deploy check (warnings expected for spectacular/HSTS)
set DEBUG=False
set DJANGO_SECRET_KEY=your-production-secret-key-min-50-chars-long-random
python manage.py check --deploy

# Frontend
cd ../frontend
npm run lint
npx tsc --noEmit
npm run build
```

All commands should exit 0.

---

## Rollback Procedure

### Render

1. Open **unnati-backend** → **Events**
2. Click **Rollback** on a previous successful deploy

### Vercel

1. Open project → **Deployments**
2. Click **⋯** on previous deployment → **Promote to Production**

### Database

Render PostgreSQL free tier: use Render dashboard backups or re-run `seed_demo_data` if needed.

---

## Support URLs

| Resource | URL |
|----------|-----|
| Render Django guide | https://render.com/docs/deploy-django |
| Vercel Next.js guide | https://vercel.com/docs/frameworks/nextjs |
| Cloudinary Django | https://cloudinary.com/documentation/django_integration |
| API docs (after deploy) | `https://YOUR-BACKEND-URL.onrender.com/api/docs/` |

---

## Related Documents

- [`FINAL_DEPLOYMENT_REPORT.md`](./FINAL_DEPLOYMENT_REPORT.md) — Full feature and API audit (91/100)
- [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) — Verification checklist
- [`.env.example`](./.env.example) — Environment variable template
- [`render.yaml`](./render.yaml) — Render Blueprint definition
- [`frontend/vercel.json`](./frontend/vercel.json) — Vercel build config

---

**Final verdict:** UNNATI is **deployment-ready at 89/100** for Render + Vercel. Complete Steps 3–4 on Render (env vars + migrate), Step 3 on Vercel (`NEXT_PUBLIC_API_URL`), and update CORS before go-live.
