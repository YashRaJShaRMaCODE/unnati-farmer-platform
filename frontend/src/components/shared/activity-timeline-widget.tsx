"use client";

import {
  CreditCard,
  FileText,
  Leaf,
  Map,
  Shield,
  Sprout,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ActivityEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  user: User,
  map: Map,
  sprout: Sprout,
  leaf: Leaf,
  file: FileText,
  "credit-card": CreditCard,
  shield: Shield,
};

export function ActivityTimelineWidget({
  events,
  max = 8,
  title = "Activity Timeline",
}: {
  events: ActivityEvent[];
  max?: number;
  title?: string;
}) {
  const visible = events.slice(0, max);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="py-4 text-center text-sm text-emerald-600">No activity yet</p>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-emerald-100" />
            {visible.map((event, i) => {
              const Icon = ICON_MAP[event.icon] || User;
              return (
                <div
                  key={`${event.type}-${event.date}-${i}`}
                  className={cn(
                    "relative flex gap-3 pb-4 last:pb-0",
                    i === 0 && "animate-slide-up"
                  )}
                >
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-emerald-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-emerald-950">{event.title}</p>
                    <p className="text-xs text-emerald-600">{formatDate(event.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
