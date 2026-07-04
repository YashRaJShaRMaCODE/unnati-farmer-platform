"use client";

import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export function StatCard({
  title,
  value,
  subtitle,
  href,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  icon?: React.ElementType;
  trend?: string;
  className?: string;
}) {
  const content = (
    <Card
      className={cn(
        "group transition-all duration-200",
        href && "cursor-pointer hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">{title}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-950">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-emerald-600">{subtitle}</p>
            )}
            {trend && (
              <p className="mt-1 text-xs font-medium text-lime-700">{trend}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
            )}
            {href && (
              <ArrowUpRight className="h-4 w-4 text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export function MetricCard({
  label,
  amount,
  href,
}: {
  label: string;
  amount: number | string;
  href?: string;
}) {
  return (
    <StatCard
      title={label}
      value={typeof amount === "number" ? formatCurrency(amount) : amount}
      href={href}
    />
  );
}
