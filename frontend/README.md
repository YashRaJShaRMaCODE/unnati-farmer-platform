# UNNATI web app

Farmer-first frontend for UNNATI’s records, public schemes, marketplace, finance guidance, and support tools. Built with Next.js App Router, TypeScript, Tailwind CSS, and React Query.

**Live app:** [unnati-farmer-platform.vercel.app](https://unnati-farmer-platform.vercel.app/)

## Run locally

From this directory:

```bash
npm ci
```

Copy `.env.local.example` to `.env.local` and set the API and canonical site URLs:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the Django API from `../backend`, then run:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy

Vercel uses this directory as the project root. Set `NEXT_PUBLIC_API_URL` to the deployed Django API’s `/api` endpoint and `NEXT_PUBLIC_SITE_URL` to the public frontend URL. The backend must allow that frontend origin in `CORS_ALLOWED_ORIGINS`.

The app adds global `nosniff`, frame denial, referrer policy, and browser permissions headers. Vercel provides HSTS for the deployed domain.

For full-stack setup and API details, see the [project README](../README.md) and [deployment guide](../FINAL_DEPLOYMENT_GUIDE.md).
