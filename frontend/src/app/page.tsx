import Link from "next/link";
import { ArrowRight, Shield, Sprout, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-lime-900 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Sprout className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">UNNATI</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-lime-400 text-emerald-950 hover:bg-lime-300">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-lime-300">
              Final Year B.Tech Project
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
              Farmer Trust, Credit & Transparency Platform
            </h1>
            <p className="mb-8 text-lg text-emerald-100">
              Empower farmers with verified trust scores, loan eligibility insights,
              transparent marketplace transactions, and government scheme access.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-lime-400 text-emerald-950 hover:bg-lime-300">
                  Join UNNATI <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button size="lg" variant="outline" className="border-lime-300/50 bg-white/10 text-white hover:bg-white/20">
                  Quick Start for Farmers
                </Button>
              </Link>
              <Link href="/project-overview">
                <Button size="lg" variant="outline" className="border-lime-300/50 bg-white/10 text-white hover:bg-white/20">
                  Project Overview (Viva)
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Shield, title: "Trust Score", desc: "100-point verification & performance score" },
              { icon: TrendingUp, title: "Loan Eligibility", desc: "AI-driven credit assessment for banks" },
              { icon: Sprout, title: "Marketplace", desc: "Direct farmer-to-buyer crop trading" },
              { icon: Shield, title: "Transparency", desc: "Complaints, schemes & audit trails" },
            ].map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/10 text-white backdrop-blur">
                <CardHeader>
                  <item.icon className="h-8 w-8 text-lime-300" />
                  <CardTitle className="text-white">{item.title}</CardTitle>
                  <CardDescription className="text-emerald-100">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
