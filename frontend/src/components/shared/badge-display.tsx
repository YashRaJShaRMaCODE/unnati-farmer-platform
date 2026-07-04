"use client";

import { Award, Crown, Medal, Shield, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { FarmerBadge } from "@/types";

const TIER_STYLES: Record<FarmerBadge["tier"], string> = {
  gold: "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-900",
  silver: "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800",
  bronze: "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-900",
};

const ICON_MAP: Record<string, React.ElementType> = {
  shield: Shield,
  star: Star,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
};

export function BadgeDisplay({
  badges,
  size = "sm",
  max = 4,
  className,
}: {
  badges: FarmerBadge[];
  size?: "sm" | "md";
  max?: number;
  className?: string;
}) {
  if (!badges?.length) return null;

  const visible = badges.slice(0, max);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((badge) => {
        const Icon = ICON_MAP[badge.icon] || Award;
        return (
          <span
            key={badge.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border font-medium capitalize",
              TIER_STYLES[badge.tier],
              size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
            )}
            title={`${badge.label} (${badge.tier})`}
          >
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}

export function TrustScoreBadge({
  score,
  category,
  size = "sm",
}: {
  score: number;
  category?: string;
  size?: "sm" | "md";
}) {
  const variant =
    score >= 85 ? "gold" : score >= 70 ? "silver" : score >= 50 ? "bronze" : "bronze";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        TIER_STYLES[variant],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Shield className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {score} {category ? `· ${category}` : ""}
    </span>
  );
}

export function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 font-medium text-emerald-800",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Shield className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Verified
    </span>
  );
}
