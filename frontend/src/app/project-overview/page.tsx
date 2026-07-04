import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cpu,
  Layers,
  Shield,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODULES = [
  { name: "Farmers & Onboarding", desc: "Quick register, profile completion, health cards" },
  { name: "Lands & Crops", desc: "Land records, crop tracking, yield analytics" },
  { name: "Marketplace", desc: "Listings, transactions, trust badges on sellers" },
  { name: "Trust Score Engine", desc: "100-point score across 5 weighted components" },
  { name: "Loan Eligibility", desc: "Credit assessment for banks using trust + farm data" },
  { name: "Government Schemes", desc: "Scheme catalog, applications, AI recommendations" },
  { name: "Complaints & Transparency", desc: "Grievance tracking with resolution timeline" },
  { name: "Analytics Dashboards", desc: "Role-based views for farmer, bank, gov, admin" },
];

export default function ProjectOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-950">UNNATI</p>
              <p className="text-xs text-emerald-600">Project Overview · Viva Presentation</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/onboarding">
              <Button variant="outline" size="sm">
                Quick Start
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section className="animate-fade-in text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-emerald-600">
            B.Tech Final Year Project
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-emerald-950 md:text-5xl">
            UNNATI — Farmer Trust, Credit & Transparency Platform
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-700">
            A full-stack digital platform empowering Indian farmers with verified trust scores,
            loan eligibility, transparent marketplace trading, and government scheme access.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="hover-lift animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-800">
              <p>
                Smallholder farmers lack verifiable digital identity, making it hard to access
                credit, fair market prices, and government benefits.
              </p>
              <p>
                Banks cannot assess rural credit risk; buyers cannot verify seller trust;
                scheme eligibility remains opaque and manual.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-800">
              <p>
                UNNATI computes a 100-point Trust Score from verification, transactions, buyer
                ratings, scheme participation, and complaint history.
              </p>
              <p>
                Role-based dashboards serve farmers, buyers, banks, government officials, and
                admins with tailored workflows and analytics.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-emerald-950">
            <Layers className="h-5 w-5" />
            System Architecture
          </h2>
          <Card className="overflow-x-auto">
            <CardContent className="p-6 font-mono text-xs leading-relaxed text-emerald-900">
              <pre className="whitespace-pre">{`
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (React)                  │
│  Dashboards · Marketplace · Trust Simulator · Health Card   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (JWT Auth)
┌──────────────────────────▼──────────────────────────────────┐
│              Django REST Framework Backend                     │
│  farmers · lands · crops · marketplace · schemes · loans      │
│  trustscore · complaints · notifications · analytics · AI     │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │     SQLite / PostgreSQL  │
              │     Media Storage        │
              └─────────────────────────┘
`}</pre>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-emerald-950">Modules</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODULES.map((mod) => (
              <Card key={mod.name} className="hover-lift">
                <CardContent className="p-4">
                  <p className="font-semibold text-emerald-950">{mod.name}</p>
                  <p className="mt-1 text-sm text-emerald-700">{mod.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Trust Score Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-800">
              <p className="font-mono text-emerald-950">
                Total = V + T + B + G + C (max 100)
              </p>
              <ul className="space-y-1">
                <li>Verification (V): max 20 — Aadhaar, profile verification</li>
                <li>Transactions (T): max 30 — completed marketplace sales</li>
                <li>Buyer Rating (B): max 20 — revenue from completed trades</li>
                <li>Government (G): max 15 — scheme application approval ratio</li>
                <li>Complaints (C): max 15 — resolution track record</li>
              </ul>
              <p className="pt-2 text-emerald-600">
                Categories: Excellent (≥85) · Good (≥70) · Average (≥50) · High Risk (&lt;50)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Eligibility Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-800">
              <p>
                Eligible amount is derived from trust score, total land area, marketplace revenue,
                and completed transaction count.
              </p>
              <p className="font-mono text-emerald-950">
                Base = trust_score × land_factor × revenue_factor
              </p>
              <p>
                Risk categories (low / medium / high) guide bank lending decisions with
                personalized recommendations displayed on the farmer dashboard.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-emerald-950">
            <Cpu className="h-5 w-5" />
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js 15",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "TanStack Query",
              "Recharts",
              "Django REST",
              "JWT Auth",
              "SQLite",
              "Gemini AI",
              "jsPDF",
              "Web Speech API",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-emerald-800">
                <li>Faster farmer onboarding with voice input (Hindi/English)</li>
                <li>Transparent trust scoring for buyers and banks</li>
                <li>Digital health card with PDF export</li>
                <li>Village-level analytics for government planning</li>
                <li>AI assistant for farming, loan, and scheme guidance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Future Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-emerald-800">
                <li>Mobile app with offline sync</li>
                <li>Blockchain-based land record verification</li>
                <li>Integration with PM-KISAN and e-NAM APIs</li>
                <li>SMS/UPI notifications for rural connectivity</li>
                <li>ML-based crop price forecasting</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-600 p-8 text-white">
          <h2 className="text-xl font-bold">Demo Instructions</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-emerald-50">
            <li>
              Register via{" "}
              <Link href="/onboarding" className="underline">
                Quick Start for Farmers
              </Link>{" "}
              or full registration
            </li>
            <li>Login as farmer — explore Dashboard, add Land & Crop records</li>
            <li>View Trust Score, run Trust Simulator, download Health Card PDF</li>
            <li>Create marketplace listing; login as buyer to purchase</li>
            <li>Login as bank/government/admin for analytics dashboards</li>
            <li>Try AI Assistant and voice input on form fields</li>
          </ol>
          <Link href="/login" className="mt-6 inline-block">
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50">
              Start Demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
