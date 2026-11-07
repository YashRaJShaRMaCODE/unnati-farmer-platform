# UNNATI – Farmer Trust, Credit & Transparency Platform

A full-stack farmer services platform with a Django REST API and Next.js frontend.

**Live app:** [unnati-farmer-platform.vercel.app](https://unnati-farmer-platform.vercel.app/) · **API health:** [unnati-backend-3zhi.onrender.com/healthz/](https://unnati-backend-3zhi.onrender.com/healthz/)

## Tech Stack

**Backend:** Django 6, DRF, JWT, PostgreSQL, Cloudinary, drf-spectacular  
**Frontend:** Next.js, TypeScript, Tailwind CSS, React Query, Axios, Recharts

## Key Features

- Role-based dashboards (`farmer`, `buyer`, `government`, `bank`, `admin`)
- Trust score, loan eligibility, schemes, marketplace, complaints, health card
- The trust score is a demo heuristic: its sales component uses completed trade value, not buyer reviews. It does not determine loan or scheme decisions.
- **Hindi / English UI toggle** (top-right header)
- Persistent language choice also updates the document language for assistive technology.
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
npm run lint
npx tsc --noEmit
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
1. Deploy the Render Blueprint. It runs migrations before starting; `/healthz/` checks both the app and database.
2. Deploy Vercel with root directory `frontend`, `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api`, and `NEXT_PUBLIC_SITE_URL=https://YOUR-SITE.vercel.app`.
3. Set `CORS_ALLOWED_ORIGINS` on Render to your Vercel URL.
4. Set Cloudinary env vars on Render for file uploads. Keep demo data in a separate staging database; never seed demo users into production.

Public registration is limited to farmer and buyer accounts. Government, bank, and admin roles must be assigned through a trusted admin workflow. Farmers receive a private profile at signup; Aadhaar is optional. Trust and eligibility scores are guidance only, not bank decisions or government approvals.

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

## Local demo data

The `seed_demo_data` management command creates synthetic sample records for isolated development or staging databases. Set a unique `UNNATI_DEMO_PASSWORD` in the project `.env` file before running it. Do not seed demo accounts into production. Use `clear_demo_data` when removing sample records.
