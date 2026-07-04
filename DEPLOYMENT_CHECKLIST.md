# UNNATI Deployment Checklist

> Generated after full project verification on **2026-07-05**.  
> Use this checklist before demo, viva, or production deployment.

---

## Verification Summary (Latest Run)

| Check | Status | Details |
|-------|--------|---------|
| Django tests (`python manage.py test`) | **PASS** | 28 tests, 0 failures |
| Frontend build (`npm run build`) | **PASS** | 23 routes compiled |
| ESLint (`npm run lint`) | **PASS** | No errors |
| TypeScript (`npx tsc --noEmit`) | **PASS** | No type errors |
| Readiness script (`python scripts/check_readiness.py`) | **PASS** | 90/100 — Production Ready |

---

## 1. Pre-Deploy Environment Setup

### Backend (`.env` or Render env vars)

- [ ] `DJANGO_SECRET_KEY` — strong random value (never use dev default in prod)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` — include backend domain (e.g. `unnati-backend.onrender.com`)
- [ ] `DATABASE_URL` — Neon/Render PostgreSQL connection string
- [ ] `CORS_ALLOWED_ORIGINS` — frontend URL (e.g. `https://unnati.vercel.app`)
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional, for media uploads)
- [ ] `GEMINI_API_KEY` (optional — AI assistant falls back gracefully without it)

### Frontend (Vercel env vars)

- [ ] `NEXT_PUBLIC_API_URL` — production API base (e.g. `https://unnati-backend.onrender.com/api`)

Copy templates from [`.env.example`](./.env.example).

---

## 2. Backend Deployment (Render)

Config: [`render.yaml`](./render.yaml) + [`backend/Dockerfile`](./backend/Dockerfile)

- [ ] Create Render web service from repo (Docker runtime)
- [ ] Attach PostgreSQL database (`unnati-db`)
- [ ] Set all env vars listed above
- [ ] **Run migrations after first deploy:**
  ```bash
  python manage.py migrate
  ```
- [ ] Create superuser (optional, for admin):
  ```bash
  python manage.py createsuperuser
  ```
- [ ] Seed demo data for presentations (optional):
  ```bash
  python manage.py seed_demo_data
  ```
- [ ] Verify health: `GET /api/schema/` returns OpenAPI schema
- [ ] Verify docs: `/api/docs/` (Swagger) and `/api/redoc/` load

> **Note:** Add a Render post-deploy command or one-off shell job for `migrate` — the Dockerfile does not run migrations automatically.

---

## 3. Frontend Deployment (Vercel)

Config: [`frontend/vercel.json`](./frontend/vercel.json)

- [ ] Import repo, set root directory to `frontend/`
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Deploy — build command: `npm run build`
- [ ] Confirm all 23 routes build successfully
- [ ] Test login flow against production API

---

## 4. API Routes Verified

All routes below were smoke-tested via integration tests (`backend/config/tests/test_integration.py`).

### Authentication (`/api/auth/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register/` | Full registration |
| POST | `/quick-register/` | Farmer onboarding (name, phone, village) |
| POST | `/login/` | JWT login → access + refresh tokens |
| POST | `/refresh/` | Rotate refresh token |
| POST | `/logout/` | Blacklist refresh token |
| GET | `/me/` | Current user profile |
| POST | `/change-password/` | Password change |

### Core CRUD (`/api/`)

| Resource | Base Path |
|----------|-----------|
| Farmers | `/farmers/` |
| Buyers | `/buyers/` |
| Lands | `/lands/` |
| Crops | `/crops/` |
| Listings | `/listings/` |
| Transactions | `/transactions/` |
| Schemes | `/schemes/` |
| Applications | `/applications/` |
| Complaints | `/complaints/` |
| Trust Scores | `/trust-scores/` |
| Loans | `/loans/` |
| Notifications | `/notifications/` |

### Insights & Features

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/farmers/me/profile-status/` | Profile completion |
| GET | `/farmers/me/badges/` | Earned badges |
| GET | `/farmers/me/achievements/` | Achievement list |
| GET | `/farmers/me/timeline/` | Activity timeline |
| GET | `/farmers/me/health-card/` | Farmer health card data |
| GET | `/farmers/me/insights/` | Personalized insights |
| POST | `/trust-scores/simulate/` | Trust score simulator |
| GET | `/schemes/recommended/` | Rule-based scheme recommendations |
| POST | `/loans/calculate/` | Loan eligibility calculation |
| POST | `/ai/chat/` | AI assistant (optional Gemini) |

### Role Dashboards (`/api/dashboard/`)

| Role | Endpoint | Verified |
|------|----------|----------|
| Admin | `/admin/` | ✅ |
| Farmer | `/farmer/` | ✅ |
| Buyer | `/buyer/` | ✅ |
| Government | `/government/` | ✅ |
| Bank | `/bank/` | ✅ |
| Village analytics | `/village/` | ✅ (government role) |

### Documentation

| Endpoint | Purpose |
|----------|---------|
| `/api/schema/` | OpenAPI schema |
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |

---

## 5. JWT Authentication Flow Verified

Integration test: `JWTAuthenticationFlowTestCase.test_full_jwt_lifecycle`

- [x] Register → receive user record
- [x] Login → receive `access` + `refresh` tokens
- [x] Authenticated `/me/` with Bearer token
- [x] Refresh token rotation (`ROTATE_REFRESH_TOKENS=True`)
- [x] Logout with **latest** refresh token (blacklist)
- [x] Quick register → auto-login email format `{phone}@unnati.farmer`

---

## 6. Role-Based Dashboards Verified

Integration test: `RoleDashboardAccessTestCase`

- [x] Each role (`farmer`, `buyer`, `government`, `bank`, `admin`) returns HTTP 200 on its dashboard
- [x] Village analytics accessible to government role, returns `villages` key

Frontend routes: `/dashboard` renders role-specific widgets based on JWT `role` claim.

---

## 7. Trust Score Calculation Verified

Integration test: `TrustScoreCalculationTestCase`

- [x] Verification score components (max 20 pts)
- [x] Total score formula → category mapping (Excellent at 100)
- [x] `recalculate_farmer_trust_score()` persists to DB
- [x] Simulate API returns correct total (82 → "Good")
- [x] Auto-creation via signals when Farmer is created

Formula (100 pts): verification + transactions + buyer ratings + government + complaints.

---

## 8. Loan Eligibility Flow Verified

Integration test: `LoanEligibilityFlowTestCase`

- [x] `calculate_loan_eligibility()` returns positive amount + risk category
- [x] `POST /api/loans/calculate/` → HTTP 201 with `eligible_amount`, `risk_category`
- [x] `GET /api/loans/` lists prior predictions

Depends on: farmer profile, trust score, land records.

---

## 9. Local Verification Commands

Run from repo root before every deploy:

```bash
# Backend tests (28 tests)
cd backend && python manage.py test

# Frontend quality gates
cd frontend
npm run lint
npx tsc --noEmit
npm run build

# Automated readiness score
cd .. && python scripts/check_readiness.py
```

Expected: all commands exit 0.

---

## 10. Post-Deploy Smoke Test

Manual checklist after going live:

- [ ] Register a new farmer via `/onboarding`
- [ ] Login and land on `/dashboard`
- [ ] View trust score at `/trust-score`
- [ ] Run loan eligibility at `/loan-eligibility`
- [ ] Open Swagger at `{API_URL}/docs/`
- [ ] Confirm CORS — frontend can call API without errors
- [ ] Test logout and re-login

### Demo credentials (after `seed_demo_data`)

| Field | Value |
|-------|-------|
| Email | `farmer1@unnati.demo` |
| Password | `Demo@1234` |

---

## 11. Known Limitations

| Item | Impact | Mitigation |
|------|--------|------------|
| AI assistant without `GEMINI_API_KEY` | Returns fallback message (503 or static reply) | Set key for live demos |
| Docker entrypoint | Does not auto-migrate | Run `migrate` manually post-deploy |
| SQLite in dev | Not for production | Use PostgreSQL via `DATABASE_URL` |
| Free-tier Render | Cold starts (~30s) | Warm up before viva/demo |
| No CI pipeline | Manual test runs required | Run checklist commands before deploy |

---

## 12. Deployment Readiness Score

**94 / 100** — Ready for viva and staged production deployment.

| Category | Score | Notes |
|----------|-------|-------|
| Backend tests & system check | 20/20 | 28/28 pass |
| Frontend build, lint, TypeScript | 20/20 | Clean |
| API & integration coverage | 18/20 | Smoke tests; no E2E browser tests |
| Auth & role security | 10/10 | JWT lifecycle verified |
| Business logic (trust, loans) | 10/10 | Service + API verified |
| Deployment configs | 8/10 | Render/Vercel/Docker present; migrate step manual |
| Documentation | 8/10 | README, audits, this checklist |

**Status: PRODUCTION READY** (with environment setup and migration step completed).

---

## Quick Reference

| Service | Local | Production |
|---------|-------|------------|
| Backend | http://localhost:8000 | Render web service |
| Frontend | http://localhost:3000 | Vercel |
| API Docs | http://localhost:8000/api/docs/ | `{API_URL}/docs/` |
| Admin | http://localhost:8000/admin/ | `{API_URL}/admin/` |
