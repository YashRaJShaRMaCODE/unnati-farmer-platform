"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { trustScoreApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { TrustScore } from "@/types";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { CircularScore } from "@/components/shared/visual-components";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";

const BREAKDOWN_MAX: Record<string, number> = {
  Verification: 20,
  Transactions: 30,
  "Buyer Rating": 20,
  Government: 15,
  Complaints: 15,
};

function categoryBadgeVariant(category: string) {
  switch (category) {
    case "Excellent":
      return "success" as const;
    case "Good":
      return "success" as const;
    case "Average":
      return "warning" as const;
    case "High Risk":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

function categoryColor(category: string) {
  switch (category) {
    case "Excellent":
      return "from-emerald-500 to-green-600";
    case "Good":
      return "from-lime-500 to-emerald-600";
    case "Average":
      return "from-amber-400 to-orange-500";
    case "High Risk":
      return "from-red-500 to-rose-600";
    default:
      return "from-emerald-400 to-emerald-600";
  }
}

function translateCategory(category: string, t: (key: string) => string) {
  switch (category) {
    case "Excellent":
      return t("pages.trustScore.excellent");
    case "Good":
      return t("pages.trustScore.good");
    case "Average":
      return t("pages.trustScore.average");
    case "High Risk":
      return t("pages.trustScore.highRisk");
    default:
      return category;
  }
}

function buildBreakdown(score: TrustScore) {
  return [
    { name: "Verification", labelKey: "pages.trustScore.verification", score: score.verification_score, max: 20 },
    { name: "Transactions", labelKey: "pages.trustScore.transactions", score: score.transaction_score, max: 30 },
    { name: "Buyer Rating", labelKey: "pages.trustScore.buyerRating", score: score.buyer_rating_score, max: 20 },
    { name: "Government", labelKey: "pages.trustScore.government", score: score.government_score, max: 15 },
    { name: "Complaints", labelKey: "pages.trustScore.complaints", score: score.complaint_score, max: 15 },
  ];
}

export default function TrustScorePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scores, isLoading, isError, refetch } = useQuery({
    queryKey: ["trust-scores"],
    queryFn: async () => (await trustScoreApi.list()).data.results,
  });

  const recalculate = useMutation({
    mutationFn: () => trustScoreApi.recalculate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trust-scores"] });
      toast.success("Trust score recalculated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to recalculate trust score")),
  });

  const score = scores?.[0];
  const breakdown = score ? buildBreakdown(score) : [];

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("pages.trustScore.title")} description={t("pages.trustScore.description")} />
        <ErrorState message={t("pages.trustScore.loadFailed")} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.trustScore.title")}
        description={t("pages.trustScore.description")}
        action={
          user?.role === "farmer" ? (
            <Button
              onClick={() => recalculate.mutate()}
              disabled={recalculate.isPending}
            >
              {recalculate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {recalculate.isPending ? t("pages.trustScore.recalculating") : t("pages.trustScore.recalculate")}
            </Button>
          ) : undefined
        }
      />

      {!score ? (
        <EmptyState
          title={t("pages.trustScore.emptyTitle")}
          description={t("pages.trustScore.emptyDescription")}
          actionLabel={user?.role === "farmer" ? t("pages.trustScore.recalculate") : undefined}
          onAction={user?.role === "farmer" ? () => recalculate.mutate() : undefined}
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${categoryColor(score.category)}`} />
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <CircularScore score={score.total_score} size={220} label={translateCategory(score.category, t)} />
              <Badge variant={categoryBadgeVariant(score.category)} className="text-sm px-4 py-1">
                <Shield className="mr-1 h-3.5 w-3.5" />
                {translateCategory(score.category, t)}
              </Badge>
              <p className="text-xs text-emerald-600">
                {t("pages.trustScore.lastCalculated", {
                  datetime: new Date(score.calculated_at).toLocaleString("en-IN"),
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("pages.trustScore.scoreBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breakdown.map((row) => ({ ...row, name: t(row.labelKey) }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" horizontal={false} />
                  <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 11 }} stroke="#059669" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                    stroke="#059669"
                  />
                  <Tooltip
                    formatter={(value, _, item) => [
                      `${value ?? 0} / ${(item?.payload as { max?: number })?.max ?? 0}`,
                      "Score",
                    ]}
                  />
                  <Bar dataKey="score" fill="#059669" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("pages.trustScore.componentDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("pages.trustScore.component")}</TableHead>
                    <TableHead>{t("pages.trustScore.score")}</TableHead>
                    <TableHead>{t("pages.trustScore.max")}</TableHead>
                    <TableHead>{t("pages.trustScore.progress")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.map((row) => {
                    const pct = Math.round((row.score / row.max) * 100);
                    return (
                      <TableRow key={row.name}>
                        <TableCell>{t(row.labelKey)}</TableCell>
                        <TableCell className="font-semibold">{row.score}</TableCell>
                        <TableCell>{BREAKDOWN_MAX[row.name]}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-100">
                              <div
                                className="h-full rounded-full bg-emerald-600 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-emerald-600">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {(user?.role === "bank" || user?.role === "admin") && scores && scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.trustScore.allFarmers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.farmer")}</TableHead>
                  <TableHead>{t("pages.trustScore.score")}</TableHead>
                  <TableHead>{t("pages.trustScore.category")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.farmer_email}</TableCell>
                    <TableCell className="font-semibold">{s.total_score}</TableCell>
                    <TableCell>
                      <Badge variant={categoryBadgeVariant(s.category)}>{translateCategory(s.category, t)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
