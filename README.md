# UNNATI – Farmer Trust, Credit & Transparency Platform

Full-stack B.Tech project with Django REST API backend and Next.js 15 frontend.

## Tech Stack

**Backend:** Django 6, DRF, JWT, PostgreSQL, Cloudinary, drf-spectacular  
**Frontend:** Next.js 15, TypeScript, Tailwind CSS, React Query, Axios, Recharts

## Key Features

- Role-based dashboards (`farmer`, `buyer`, `government`, `bank`, `admin`)
- Trust score, loan eligibility, schemes, marketplace, complaints, health card
- **Hindi / English UI toggle** (top-right header)
- **AI Assistant** with farming, loan, scheme, and trust-score contexts
  - Live answers via Gemini when `GEMINI_API_KEY` is configured
  - **Guided fallback Q&A** (Hindi + English) when AI is unavailable — no API key required for demos

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API docs: http://localhost:8000/api/docs/

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

### Environment

| File | Purpose |
|------|---------|
| `.env` (project root) | Backend secrets — Django loads this via `backend/config/settings.py` |
| `frontend/.env.local` | Frontend — set `NEXT_PUBLIC_API_URL` |

Copy `.env.example` → `.env` at the **repo root** (same folder as `backend/` and `frontend/`).

**Root `.env` (minimum for local dev):**

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
GEMINI_API_KEY=          # optional — guided fallback works without it
```

**`frontend/.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

After changing `.env`, restart Django (`python manage.py runserver`).

## Testing

```bash
cd backend
python manage.py test
```

```bash
cd frontend
npm run build
```

## Deployment

| Layer | Platform | Config |
|-------|----------|--------|
| Backend + PostgreSQL | [Render](https://render.com) | `render.yaml` |
| Frontend | [Vercel](https://vercel.com) | `frontend/vercel.json` |
| Media uploads | [Cloudinary](https://cloudinary.com) | Required in production |

**Full step-by-step guide:** [FINAL_DEPLOYMENT_GUIDE.md](./FINAL_DEPLOYMENT_GUIDE.md)

Quick checklist:
1. Deploy Render Blueprint → run `migrate` + `seed_demo_data` in Render Shell
2. Deploy Vercel with root directory `frontend` and `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api`
3. Set `CORS_ALLOWED_ORIGINS` on Render to your Vercel URL
4. Set Cloudinary env vars on Render for file uploads

## API Modules

| Module | Endpoints |
|--------|-----------|
| Auth | `/api/auth/register/`, `/login/`, `/refresh/`, `/logout/`, `/me/` |
| Farmers | `/api/farmers/` |
| Lands | `/api/lands/` |
| Crops | `/api/crops/` |
| Marketplace | `/api/listings/`, `/api/transactions/` |
| Schemes | `/api/schemes/`, `/api/applications/` |
| Complaints | `/api/complaints/` |
| Trust Score | `/api/trust-scores/` |
| Loans | `/api/loans/` |
| Notifications | `/api/notifications/` |
| Dashboards | `/api/dashboard/{role}/` |
| AI Assistant | `POST /api/ai/chat/` |

## Roles

`farmer` · `buyer` · `government` · `bank` · `admin`

## Demo & Viva

```bash
# Seed demo data for presentations
cd backend && python manage.py seed_demo_data

# Project readiness check (from repo root)
python scripts/check_readiness.py
```

**Demo login (after seed):** `farmer1@unnati.demo` / `Demo@1234`

Warm up the Render backend (~30s) before a live demo on the free tier.

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) and [FEATURES_AUDIT_REPORT.md](./FEATURES_AUDIT_REPORT.md) for full audits.

### Farmer Quick Start

New farmers can register with only **Name, Phone, Village** at `/onboarding` — no Aadhaar required upfront.
