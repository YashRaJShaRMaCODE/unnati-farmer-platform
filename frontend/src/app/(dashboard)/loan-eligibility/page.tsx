"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calculator, CreditCard, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { loansApi } from "@/lib/api";
import { cn, formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { PageSkeleton, TableSkeleton } from "@/components/ui/skeleton";
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

function riskVariant(risk: string) {
  switch (risk?.toLowerCase()) {
    case "low":
      return "success" as const;
    case "high":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

function riskMeterPercent(risk: string) {
  switch (risk?.toLowerCase()) {
    case "low":
      return 25;
    case "medium":
      return 55;
    case "high":
      return 85;
    default:
      return 50;
  }
}

function riskMeterColor(risk: string) {
  switch (risk?.toLowerCase()) {
    case "low":
      return "bg-emerald-500";
    case "high":
      return "bg-red-500";
    default:
      return "bg-amber-500";
  }
}

function GradientFinanceCard({
  title,
  value,
  subtitle,
  gradient,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  gradient: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-[1px] shadow-sm`}>
      <Card className="h-full border-0 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">{title}</p>
              <p className="mt-2 text-2xl font-bold text-emerald-950">{value}</p>
              {subtitle && <p className="mt-1 text-xs text-emerald-600">{subtitle}</p>}
            </div>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoanEligibilityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: predictions, isLoading, isError, refetch } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => (await loansApi.list()).data.results,
  });

  const calculate = useMutation({
    mutationFn: () => loansApi.calculate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Loan eligibility calculated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to calculate eligibility")),
  });

  const latest = predictions?.[0];

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("pages.loanEligibility.title")}
          description={t("pages.loanEligibility.description")}
        />
        <ErrorState message={t("pages.loanEligibility.loadFailed")} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.loanEligibility.title")}
        description={t("pages.loanEligibility.description")}
        action={
          user?.role === "farmer" ? (
            <Button onClick={() => calculate.mutate()} disabled={calculate.isPending}>
              {calculate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              {calculate.isPending ? t("pages.loanEligibility.calculating") : t("pages.loanEligibility.calculate")}
            </Button>
          ) : undefined
        }
      />

      {!latest ? (
        <EmptyState
          title={t("pages.loanEligibility.emptyTitle")}
          description={t("pages.loanEligibility.emptyDescription")}
          actionLabel={user?.role === "farmer" ? t("pages.loanEligibility.calculateNow") : undefined}
          onAction={user?.role === "farmer" ? () => calculate.mutate() : undefined}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <GradientFinanceCard
              title={t("pages.loanEligibility.eligibleAmount")}
              value={formatCurrency(latest.eligible_amount)}
              subtitle={t("pages.loanEligibility.maxLoan")}
              gradient="from-emerald-400 via-emerald-500 to-teal-600"
              icon={CreditCard}
            />
            <GradientFinanceCard
              title={t("pages.loanEligibility.riskCategory")}
              value={
                <Badge variant={riskVariant(latest.risk_category)} className="text-base capitalize">
                  {latest.risk_category}
                </Badge>
              }
              subtitle={t("pages.loanEligibility.profileAnalysis")}
              gradient="from-amber-400 via-orange-400 to-amber-500"
              icon={TrendingUp}
            />
            <GradientFinanceCard
              title={t("pages.loanEligibility.trustScoreUsed")}
              value={`${latest.trust_score}/100`}
              subtitle={t("pages.loanEligibility.atCalculation")}
              gradient="from-lime-400 via-emerald-500 to-green-600"
              icon={Calculator}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("pages.loanEligibility.riskMeter")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative h-4 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-red-200">
                <div
                  className={cn(
                    "absolute top-0 h-full w-1 -translate-x-1/2 rounded-full shadow-md transition-all duration-700",
                    riskMeterColor(latest.risk_category)
                  )}
                  style={{ left: `${riskMeterPercent(latest.risk_category)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-emerald-600">
                <span>{t("pages.loanEligibility.lowRisk")}</span>
                <span className="font-medium capitalize">{latest.risk_category} Risk</span>
                <span>{t("pages.loanEligibility.highRisk")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("pages.loanEligibility.recommendation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-800">{latest.recommendation}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <span className="text-emerald-600">{t("pages.loanEligibility.landSize")}</span>{" "}
                  <span className="font-medium">{latest.land_size} ac</span>
                </div>
                <div>
                  <span className="text-emerald-600">{t("pages.loanEligibility.revenue")}</span>{" "}
                  <span className="font-medium">{formatCurrency(latest.revenue)}</span>
                </div>
                <div>
                  <span className="text-emerald-600">Transactions:</span>{" "}
                  <span className="font-medium">{latest.transaction_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("pages.loanEligibility.predictionHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : (predictions || []).length === 0 ? (
            <EmptyState
              title={t("pages.loanEligibility.noHistory")}
              description={t("pages.loanEligibility.noHistoryDesc")}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.farmer")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("pages.loanEligibility.riskCategory")}</TableHead>
                  <TableHead>{t("pages.trustScore.score")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(predictions || []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.farmer_email}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(p.eligible_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={riskVariant(p.risk_category)} className="capitalize">
                        {p.risk_category}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.trust_score}</TableCell>
                    <TableCell>{formatDate(p.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
