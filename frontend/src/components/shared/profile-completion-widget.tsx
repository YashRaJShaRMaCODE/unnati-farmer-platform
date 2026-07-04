"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { ProfileCompletion } from "@/types";
import { BadgeDisplay } from "@/components/shared/badge-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MILESTONE_ROUTES: Record<string, string> = {
  basic: "/profile",
  aadhaar: "/profile",
  land: "/lands",
  crop: "/crops",
  documents: "/profile",
};

function nextStepHref(milestones: ProfileCompletion["milestones"]): string {
  const pending = milestones.find((m) => !m.done);
  if (pending) return MILESTONE_ROUTES[pending.key] || "/profile";
  return "/health-card";
}

export function ProfileCompletionWidget({
  data,
}: {
  data: ProfileCompletion;
}) {
  const href = nextStepHref(data.milestones);
  const rewardBadges = data.reward_badges.map((label, i) => ({
    id: `reward-${i}`,
    label,
    icon: "award",
    tier: (data.percent >= 80 ? "gold" : data.percent >= 40 ? "silver" : "bronze") as
      | "gold"
      | "silver"
      | "bronze",
  }));

  return (
    <Card className="animate-slide-up hover-lift">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Profile Completion</CardTitle>
          <span className="text-2xl font-bold text-emerald-700">{data.percent}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-700"
            style={{ width: `${data.percent}%` }}
          />
        </div>

        <ul className="space-y-2">
          {data.milestones.map((m) => (
            <li key={m.key} className="flex items-center gap-2 text-sm">
              {m.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-emerald-300" />
              )}
              <span className={m.done ? "text-emerald-800" : "text-emerald-600"}>
                {m.label}
              </span>
            </li>
          ))}
        </ul>

        {rewardBadges.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-emerald-600">Reward Badges</p>
            <BadgeDisplay badges={rewardBadges} max={5} />
          </div>
        )}

        {data.percent < 100 && (
          <Link href={href}>
            <Button variant="outline" className="w-full gap-2">
              Next: {data.next_step}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
