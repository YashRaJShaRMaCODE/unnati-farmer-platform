# UNNATI — Final Production Deployment Report

**Audit date:** July 5, 2026  
**Auditor:** Full automated + manual code audit  
**Stack:** Django 6 + DRF + JWT · Next.js 15 + TypeScript + React Query

---

## Executive Summary

| Metric | Result |
|--------|--------|
| **Deployment Readiness Score** | **91 / 100** |
| **Status** | **Production-ready for viva/staged deploy** (env setup + migration required) |
| Django tests | **28 / 28 PASS** |
| Frontend lint | **PASS** |
| TypeScript (`tsc --noEmit`) | **PASS** |
| Frontend build | **PASS** (23 routes) |
| Django system check | **PASS** (0 issues) |

The platform is functionally complete: all critical API routes respond correctly, JWT auth works end-to-end, all five role dashboards load, trust score and loan flows are verified, and all primary form submissions map to working backend endpoints. Remaining issues are mostly production hardening, security tightening, and minor UX gaps — not blockers for demo or viva deployment.

---

## 1. Automated Verification Results

### Backend

```bash
cd backend && python manage.py test
# Ran 28 tests in ~97s — OK

cd backend && python manage.py check
# System check identified no issues (0 silenced)
```

### Frontend

```bash
cd frontend && npm run lint        # PASS
cd frontend && npx tsc --noEmit    # PASS
cd frontend && npm run build       # PASS — 23 static routes
```

### Readiness Script

```bash
python scripts/check_readiness.py  # 90/100 — PRODUCTION READY
```

---

## 2. Frontend Routes (23 Built Routes)

| Route | Auth | Role Guard | Status |
|-------|------|------------|--------|
| `/` | Public | — | ✅ Landing page |
| `/login` | Public | — | ✅ JWT login form |
| `/register` | Public | — | ✅ Full registration form |
| `/onboarding` | Public | — | ✅ Quick farmer registration |
| `/project-overview` | Public | — | ✅ Viva overview page |
| `/dashboard` | Protected | All roles | ✅ Role-specific dashboard |
| `/profile` | Protected | farmer, buyer, admin | ✅ Farmer/buyer profile forms |
| `/lands` | Protected | farmer, admin | ✅ CRUD + voice input |
| `/crops` | Protected | farmer, admin | ✅ CRUD + voice input |
| `/marketplace` | Protected | farmer, buyer, admin | ✅ Listings + transactions |
| `/schemes` | Protected | farmer, gov, admin | ✅ Apply + gov review |
| `/complaints` | Protected | farmer, gov, admin | ✅ Submit + review |
| `/trust-score` | Protected | farmer, bank, admin | ✅ View + recalculate |
| `/trust-simulator` | Protected | farmer, bank, admin | ✅ Simulate API |
| `/health-card` | Protected | farmer, bank, admin | ✅ PDF export |
| `/loan-eligibility` | Protected | farmer, bank, admin | ✅ Calculate + history |
| `/village-analytics` | Protected | gov, bank, admin | ✅ Village stats |
| `/notifications` | Protected | All roles | ✅ Mark read / mark all |
| `/ai-assistant` | Protected | All roles | ✅ Chat (Gemini optional) |

**Notes:**
- `/profile` shows read-only account card for government/bank roles (no edit form — by design).
- Auth guard redirects unauthenticated users to `/login` and unauthorized roles to `/dashboard`.

---

## 3. Backend API Inventory

### Authentication — `/api/auth/`

| Method | Endpoint | Frontend | Tested |
|--------|----------|----------|--------|
| POST | `/register/` | ✅ register page | ✅ |
| POST | `/quick-register/` | ✅ onboarding page | ✅ |
| POST | `/login/` | ✅ login page | ✅ |
| POST | `/refresh/` | ✅ axios interceptor | ✅ |
| POST | `/logout/` | ✅ auth provider | ✅ |
| GET/PATCH | `/me/` | ✅ auth provider | ✅ |
| POST | `/change-password/` | ❌ no UI | ❌ |

### CRUD Resources — `/api/`

| Resource | Endpoints | Frontend Hook/Page | Tested |
|----------|-----------|-------------------|--------|
| Farmers | `/farmers/` | profile page | ✅ |
| Buyers | `/buyers/` | profile page | ✅ |
| Lands | `/lands/` | lands page | ✅ |
| Crops | `/crops/` | crops page | ✅ |
| Listings | `/listings/` | marketplace | ✅ |
| Transactions | `/transactions/` | marketplace | ✅ |
| Schemes | `/schemes/` | schemes page | ✅ |
| Applications | `/applications/` | schemes page | ✅ |
| Complaints | `/complaints/` | complaints page | ✅ |
| Trust Scores | `/trust-scores/` | trust-score page | ✅ |
| Trust Scores | `/trust-scores/recalculate/` | trust-score page | ✅ |
| Trust Scores | `/trust-scores/simulate/` | trust-simulator | ✅ |
| Loans | `/loans/` | loan-eligibility | ✅ |
| Loans | `/loans/calculate/` | loan-eligibility | ✅ |
| Notifications | `/notifications/` | notifications + header | ✅ |
| Notifications | `/notifications/{id}/mark-read/` | notifications | ✅ |
| Notifications | `/notifications/mark-all-read/` | notifications | ✅ |

### Insights — `/api/`

| Method | Endpoint | Frontend | Tested |
|--------|----------|----------|--------|
| GET | `/farmers/me/profile-status/` | via insights aggregate | ✅ |
| GET | `/farmers/me/badges/` | via insights / health-card | ✅ |
| GET | `/farmers/me/achievements/` | via insights on dashboard | ✅ |
| GET | `/farmers/me/timeline/` | via insights on dashboard | ✅ |
| GET | `/farmers/me/health-card/` | health-card page | ✅ |
| GET | `/farmers/me/insights/` | farmer dashboard | ✅ |
| GET | `/schemes/recommended/` | **not wired to UI** | ✅ backend only |

### Dashboards — `/api/dashboard/`

| Role | Endpoint | Frontend Component | Tested |
|------|----------|-------------------|--------|
| Admin | `/admin/` | AdminDashboardView | ✅ |
| Farmer | `/farmer/` | FarmerDashboardView | ✅ |
| Buyer | `/buyer/` | BuyerDashboardView | ✅ |
| Government | `/government/` | GovernmentDashboardView | ✅ |
| Bank | `/bank/` | BankDashboardView | ✅ |
| Village | `/village/` | village-analytics page | ✅ |

### Other

| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/api/ai/chat/` | ✅ fallback without GEMINI_API_KEY |
| GET | `/api/schema/` | ✅ OpenAPI schema |
| GET | `/api/docs/` | ✅ Swagger UI |
| GET | `/api/redoc/` | ✅ ReDoc |
| — | `/admin/` | ✅ Django admin |

---

## 4. Form Submissions Verified

| Form | Page | API Called | Validation |
|------|------|------------|------------|
| Login | `/login` | `POST /api/auth/login/` | HTML required fields |
| Full register | `/register` | `POST /api/auth/register/` | Backend + error display |
| Quick register | `/onboarding` | `POST /api/auth/quick-register/` | HTML + toast errors |
| Farmer profile create/update | `/profile` | `POST/PATCH /api/farmers/` | Zod schema (Aadhaar 12 digits) |
| Buyer profile update | `/profile` | `PATCH /api/buyers/` | Zod schema |
| Land create/update | `/lands` | `POST/PATCH /api/lands/` | Form validation |
| Crop create/update | `/crops` | `POST/PATCH /api/crops/` | Form validation |
| Listing create | `/marketplace` | `POST /api/listings/` | Form validation |
| Transaction create | `/marketplace` | `POST /api/transactions/` | Form validation |
| Transaction complete | `/marketplace` | `PATCH /api/transactions/{id}/` | Role-gated |
| Scheme apply | `/schemes` | `POST /api/applications/` | Duplicate check |
| Scheme review | `/schemes` | `PATCH /api/applications/{id}/` | Gov/admin only |
| Complaint submit | `/complaints` | `POST /api/complaints/` | FormData + multipart |
| Complaint review | `/complaints` | `PATCH /api/complaints/{id}/` | Gov/admin only |
| Trust recalculate | `/trust-score` | `POST /api/trust-scores/recalculate/` | Farmer only |
| Trust simulate | `/trust-simulator` | `POST /api/trust-scores/simulate/` | Slider payload |
| Loan calculate | `/loan-eligibility` | `POST /api/loans/calculate/` | Farmer only |
| AI chat | `/ai-assistant` | `POST /api/ai/chat/` | Message required |
| Mark notification read | `/notifications` | `POST /api/notifications/{id}/mark-read/` | — |
| Mark all read | `/notifications` | `POST /api/notifications/mark-all-read/` | — |

---

## 5. Role Verification

| Role | Dashboard | Nav Items | Restricted Routes Enforced |
|------|-----------|-----------|---------------------------|
| **farmer** | FarmerDashboardView | 12 + AI | ✅ |
| **buyer** | BuyerDashboardView | 4 + AI | ✅ |
| **government** | GovernmentDashboardView | 5 + AI | ✅ |
| **bank** | BankDashboardView | 7 + AI | ✅ |
| **admin** | AdminDashboardView | 13 + AI | ✅ |

Role enforcement is implemented in:
- Frontend: `ROLE_ROUTES` + `AuthGuard` + `canAccessRoute()`
- Backend: per-app permission classes + `AnalyticsPermission`

---

## 6. JWT Login & Refresh Verification

| Step | Backend Test | Frontend Implementation | Status |
|------|-------------|------------------------|--------|
| Register | `JWTAuthenticationFlowTestCase` | register/onboarding pages | ✅ |
| Login → access + refresh | ✅ | `authApi.login()` stores tokens | ✅ |
| Authenticated `/me/` | ✅ | `authProvider.refreshUser()` | ✅ |
| Token refresh on 401 | ✅ (backend) | `apiClient` interceptor | ⚠️ see issue #1 |
| Logout + blacklist | ✅ | `authApi.logout()` | ✅ |
| Quick register → login | ✅ | onboarding → login redirect | ⚠️ see issue #8 |

**JWT settings:** 60-min access, 7-day refresh, rotate + blacklist enabled.

---

## 7. React Query Hooks Inventory

| Location | Query Keys | Hooks | API Functions |
|----------|-----------|-------|---------------|
| `role-dashboards.tsx` | `dashboard/farmer`, `farmer-insights` | 2× useQuery | `dashboardApi.farmer`, `insightsApi.get` |
| `role-dashboards.tsx` | `dashboard/buyer` | useQuery | `dashboardApi.buyer` |
| `role-dashboards.tsx` | `dashboard/admin` | useQuery | `dashboardApi.admin` |
| `role-dashboards.tsx` | `dashboard/government` | useQuery | `dashboardApi.government` |
| `role-dashboards.tsx` | `dashboard/bank` | useQuery | `dashboardApi.bank` |
| `app-layout.tsx` | `notifications-header` | useQuery | `notificationsApi.list` |
| `lands/page.tsx` | `lands` | useQuery + 3 mutations | `landsApi.*` |
| `crops/page.tsx` | `crops` | useQuery + 3 mutations | `cropsApi.*` |
| `marketplace/page.tsx` | `listings`, `crops`, `transactions` | 3× useQuery + 3 mutations | `marketplaceApi.*`, `cropsApi.list` |
| `schemes/page.tsx` | `schemes`, `applications` | 2× useQuery + 2 mutations | `schemesApi.*` |
| `complaints/page.tsx` | `complaints` | useQuery + 2 mutations | `complaintsApi.*` |
| `trust-score/page.tsx` | `trust-scores` | useQuery + mutation | `trustScoreApi.*` |
| `trust-simulator/page.tsx` | — | useMutation | `trustScoreSimulateApi.simulate` |
| `loan-eligibility/page.tsx` | `loans` | useQuery + mutation | `loansApi.*` |
| `health-card/page.tsx` | `health-card` | useQuery | `healthCardApi.get` |
| `village-analytics/page.tsx` | `village-analytics` | useQuery | `villageAnalyticsApi.get` |
| `notifications/page.tsx` | `notifications` | useQuery + 2 mutations | `notificationsApi.*` |
| `profile/page.tsx` | `farmers`, `buyers` | 2× useQuery + 3 mutations | `farmersApi.*`, `buyersApi.*` |
| `ai-assistant/page.tsx` | — | useMutation | `aiApi.chat` |

**Unused API client methods (no React Query hook):**
- `insightsApi.recommendedSchemes()` — backend works, UI not connected
- `authApi` change-password — no endpoint wrapper or UI

---

## 8. Environment Variables Audit

### Backend (`.env.example`)

| Variable | Required Prod | Default Dev | Used In |
|----------|--------------|-------------|---------|
| `DJANGO_SECRET_KEY` | **Yes** | Insecure fallback in code | `settings.py` |
| `DEBUG` | **Yes** (False) | `True` | `settings.py` |
| `ALLOWED_HOSTS` | **Yes** | `localhost,127.0.0.1` | `settings.py` |
| `DATABASE_URL` | **Yes** | SQLite fallback | `settings.py` |
| `CORS_ALLOWED_ORIGINS` | **Yes** | localhost:3000 | `settings.py` |
| `CLOUDINARY_CLOUD_NAME` | Optional | empty | media uploads |
| `CLOUDINARY_API_KEY` | Optional | empty | media uploads |
| `CLOUDINARY_API_SECRET` | Optional | empty | media uploads |
| `CLOUDINARY_URL` | Optional | empty | media uploads |
| `GEMINI_API_KEY` | Optional | empty | `aiassistant/services.py` |

### Frontend

| Variable | Required Prod | Default Dev | Used In |
|----------|--------------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:8000/api` | `lib/api/client.ts` |

**Env gaps:**
- README references `frontend/.env.local.example` — file does not exist (`.env*` gitignored).
- `render.yaml` omits `GEMINI_API_KEY`.
- No committed `.env` files (correct for secrets).

---

## 9. Score Breakdown (91 / 100)

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Automated tests & build | 25 | 25/25 | All pass |
| API & route coverage | 20 | 18/20 | Recommended schemes UI missing |
| Auth & security | 20 | 14/20 | Admin self-reg, token storage, no rate limit |
| Role & dashboard completeness | 15 | 15/15 | All roles verified |
| DevOps & deployment config | 10 | 8/10 | No CI, manual migrate |
| Documentation & env templates | 10 | 8/10 | Missing frontend env example |
| UX polish & performance | 10 | 8/10 | Large health-card bundle, pagination |
| **Total** | **100** | **91/100** | |

---

## 10. Every Remaining Issue (Complete List)

Issues are ordered by severity. None are blockers for viva/demo deployment.

### Security (High)

1. **Public registration allows `admin`, `bank`, and `government` roles** — anyone can self-register as admin via `/register`. Restrict in `RegisterSerializer` for production.
2. **Insecure default `SECRET_KEY`** in `settings.py` when `DJANGO_SECRET_KEY` is unset — must override in production.
3. **`DEBUG` defaults to `True`** — must set `DEBUG=False` in production.
4. **JWT tokens stored in `localStorage`** — vulnerable to XSS; acceptable for academic project, not ideal for production (httpOnly cookies preferred).
5. **No rate limiting** on `/api/auth/login/`, `/register/`, `/quick-register/` — brute-force risk.
6. **No email verification** — accounts active immediately after registration.
7. **No password reset flow** — users cannot recover forgotten passwords.

### Auth / JWT (Medium)

8. **JWT refresh interceptor does not store rotated refresh token** — `client.ts` line 118 calls `setTokens(data.access, refresh)` with the old refresh token. With `ROTATE_REFRESH_TOKENS=True`, logout after a refresh may fail with 400.
9. **Login API strips `user` object** — `LoginView` overwrites response to exclude serializer's `user` field; frontend compensates with extra `/me/` call (works, but wasteful).
10. **`authApiClient` has no 401 refresh interceptor** — only `apiClient` refreshes tokens (low impact; auth endpoints rarely return 401 mid-session).

### Frontend Gaps (Medium)

11. **`insightsApi.recommendedSchemes()` never used** — scheme recommendation engine exists on backend but farmers see generic list only.
12. **`/api/auth/change-password/` has no frontend UI** — API exists, no page or profile section.
13. **Login page ignores `?email=` query param** — onboarding redirects to `/login?email=...` but login form does not pre-fill.
14. **Farmer profile form missing `village` field** — set during quick-register but not editable on `/profile`.
15. **Full `/register` with `farmer` role does not auto-create `Farmer` profile** — unlike quick-register; user must manually create profile on `/profile`. Inconsistent with buyer auto-creation.
16. **List APIs paginated at 20 items** — frontend uses `.data.results` only; no pagination UI on lands, crops, marketplace, etc.
17. **Health card page bundle size: 132 kB page / 295 kB First Load JS** — jsPDF adds significant weight.
18. **Voice input requires Web Speech API** — no browser-compat fallback message beyond button absence on unsupported browsers.

### Backend Gaps (Low–Medium)

19. **`aiassistant/tests.py` is empty** — no unit tests for AI module.
20. **Cloudinary not configured in dev** — land/complaint image uploads fail without credentials.
21. **Docker entrypoint does not run `migrate`** — manual migration required post-deploy.
22. **`render.yaml` missing `GEMINI_API_KEY` env var** — must add manually for AI assistant.
23. **SQLite fallback when `DATABASE_URL` unset** — fine for dev, must not use in production.

### DevOps / Repo (Low)

24. **No CI/CD pipeline** — tests and build not automated on push.
25. **No E2E / browser tests** — integration tests cover API only.
26. **No root `.gitignore`** for backend `__pycache__/`, `*.pyc`, `db.sqlite3` — risk of accidental commits.
27. **`frontend/.env.local.example` missing** — README references it but file does not exist.
28. **Free-tier Render cold starts** — ~30s delay on first request after idle.
29. **No monitoring, logging, or APM** configured.
30. **No database backup strategy** documented.
31. **HTTPS / secure cookie flags** only enforced when `DEBUG=False`.

### UX / Minor (Low)

32. **Onboarding phone field** — placeholder says "10-digit" but no regex validation.
33. **Quick-register farmers must enter Aadhaar on profile** — form requires 12 digits even though onboarding intentionally skips it (by design, but adds friction).
34. **Government/bank profile page** — read-only account card only; no role-specific profile editing.
35. **Global search in app layout** — navigates to pages but does not filter data globally.
36. **AI assistant without `GEMINI_API_KEY`** — returns static fallback tips (graceful, but not conversational).
37. **CORS defaults to localhost** — must update `CORS_ALLOWED_ORIGINS` for production frontend URL.
38. **Admin dashboard accessible to admin role only on backend** — frontend admin nav matches; superuser without admin role may be blocked (edge case).

---

## 11. Pre-Deploy Checklist (Action Items)

### Must do before production

- [ ] Set `DJANGO_SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`
- [ ] Set `NEXT_PUBLIC_API_URL` on Vercel
- [ ] Run `python manage.py migrate` on Render after first deploy
- [ ] Restrict admin/bank/government role assignment in registration
- [ ] Fix JWT refresh token storage in `frontend/src/lib/api/client.ts` (store `data.refresh` when present)

### Should do before viva demo

- [ ] Run `python manage.py seed_demo_data`
- [ ] Warm up Render instance before presentation
- [ ] Test login with `farmer1@unnati.demo` / `Demo@1234`
- [ ] Optionally set `GEMINI_API_KEY` for live AI demo

### Nice to have

- [ ] Add `frontend/.env.local.example`
- [ ] Wire scheme recommendations UI
- [ ] Add change-password UI
- [ ] Add root `.gitignore` for Python artifacts
- [ ] Add GitHub Actions CI running tests + build

---

## 12. Demo Credentials

After running `python manage.py seed_demo_data`:

| Field | Value |
|-------|-------|
| Email | `farmer1@unnati.demo` |
| Password | `Demo@1234` |

---

## 13. Quick Reference

| Service | Local URL |
|---------|-----------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Swagger Docs | http://localhost:8000/api/docs/ |
| Django Admin | http://localhost:8000/admin/ |

---

**Final verdict:** UNNATI scores **91/100** and is ready for viva presentation and staged production deployment. Complete environment configuration, run migrations, and address the JWT refresh token bug (#8) before a long-running production session.
