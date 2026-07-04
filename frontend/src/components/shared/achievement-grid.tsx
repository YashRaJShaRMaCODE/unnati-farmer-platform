"use client";

import { Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Achievement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AchievementGrid({
  achievements,
  title = "Achievements",
}: {
  achievements: Achievement[];
  title?: string;
}) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-xs font-medium text-emerald-600">
            {unlockedCount}/{achievements.length} unlocked
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition-all hover-lift",
                achievement.unlocked
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-emerald-100 bg-white opacity-70"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  achievement.unlocked
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-400"
                )}
              >
                {achievement.unlocked ? (
                  <Trophy className="h-5 w-5" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    achievement.unlocked ? "text-emerald-950" : "text-emerald-600"
                  )}
                >
                  {achievement.title}
                </p>
                <p className="text-xs text-emerald-500">
                  {achievement.unlocked ? "Unlocked" : "Locked"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
