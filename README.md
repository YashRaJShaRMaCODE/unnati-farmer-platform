# UNNATI – Farmer Trust, Credit & Transparency Platform

Full-stack B.Tech project with Django REST API backend and Next.js 15 frontend.

## Tech Stack

**Backend:** Django 6, DRF, JWT, PostgreSQL, Cloudinary, drf-spectacular  
**Frontend:** Next.js 15, TypeScript, Tailwind CSS, React Query, Axios, Recharts

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

Copy `.env.example` to `.env` (backend) and `frontend/.env.local.example` to `frontend/.env.local`.

Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

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

- **Backend:** Render (`render.yaml`) + Neon PostgreSQL
- **Frontend:** Vercel (`frontend/vercel.json`)

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

## Roles

`farmer` · `buyer` · `government` · `bank` · `admin`

## Demo & Viva

```bash
# Seed demo data for presentations
cd backend && python manage.py seed_demo_data

# Project readiness check (from repo root)
python scripts/check_readiness.py
```

Optional: Set `GEMINI_API_KEY` in backend environment for AI Assistant (only module using AI).

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) and [FEATURES_AUDIT_REPORT.md](./FEATURES_AUDIT_REPORT.md) for full audits.

### Farmer Quick Start

New farmers can register with only **Name, Phone, Village** at `/onboarding` — no Aadhaar required upfront.
