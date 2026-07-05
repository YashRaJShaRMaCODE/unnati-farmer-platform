"use client";

import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { healthCardApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BadgeDisplay,
  TrustScoreBadge,
} from "@/components/shared/badge-display";
import { CircularScore } from "@/components/shared/visual-components";
import { PageHeader, ErrorState } from "@/components/shared/page-shell";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HealthCard } from "@/types";
import { useTranslation } from "@/providers/language-provider";

function downloadPdf(card: HealthCard) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("UNNATI Farmer Health Card", margin, 25);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(card.generated_at)}`, margin, 33);

  doc.setTextColor(5, 46, 22);
  y = 55;
  doc.setFontSize(14);
  doc.text(card.farmer_name, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(16, 120, 80);
  doc.text(`${card.village} · ${card.phone || "N/A"} · ${card.email}`, margin, y);

  y += 15;
  doc.setTextColor(5, 46, 22);
  doc.setFontSize(12);
  doc.text(`Trust Score: ${card.trust_score} (${card.trust_category})`, margin, y);
  y += 8;
  doc.text(`Profile Completion: ${card.profile_completion}%`, margin, y);
  y += 8;
  doc.text(`Loan Eligible: ${formatCurrency(card.loan_eligible_amount)} (${card.loan_risk} risk)`, margin, y);

  y += 12;
  doc.text(`Land Records: ${card.land_count} (${card.total_land_area} acres)`, margin, y);
  y += 7;
  doc.text(`Crops: ${card.crop_count} · Schemes: ${card.schemes_applied} · Complaints: ${card.complaints}`, margin, y);
  y += 7;
  doc.text(`Revenue: ${formatCurrency(card.revenue)}`, margin, y);

  if (card.badges.length > 0) {
    y += 12;
    doc.text(`Badges: ${card.badges.map((b) => b.label).join(", ")}`, margin, y);
  }

  doc.save(`unnati-health-card-${card.farmer_name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export default function HealthCardPage() {
  const { t } = useTranslation();
  const { data: card, isLoading, isError, refetch } = useQuery({
    queryKey: ["health-card"],
    queryFn: async () => (await healthCardApi.get()).data,
  });

  const handleDownload = () => {
    if (!card) return;
    try {
      downloadPdf(card);
      toast.success("Health card PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message={t("pages.healthCard.loadFailed")} onRetry={() => refetch()} />;
  if (!card) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <PageHeader
        title={t("pages.healthCard.title")}
        description={t("pages.healthCard.description")}
        action={
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            {t("pages.healthCard.downloadPdf")}
          </Button>
        }
      />

      <Card
        className="overflow-hidden border-2 border-emerald-200 shadow-xl hover-lift"
      >
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600 px-6 py-8 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-100">
            {t("pages.healthCard.cardTitle")}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{card.farmer_name}</h2>
          <p className="mt-1 text-emerald-100">{card.village}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-emerald-50">
            <span>{card.phone || t("pages.healthCard.noPhone")}</span>
            <span>·</span>
            <span className="truncate">{card.email}</span>
          </div>
        </div>

        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <CircularScore score={card.trust_score} label={card.trust_category} size={140} />
            <div className="space-y-2 text-center sm:text-right">
              <TrustScoreBadge score={card.trust_score} category={card.trust_category} size="md" />
              <p className="text-sm text-emerald-700">
                {t("pages.healthCard.profileComplete", { percent: card.profile_completion })}
              </p>
              <Badge variant={card.loan_risk === "low" ? "success" : "warning"}>
                {t("pages.healthCard.loanRisk", { risk: card.loan_risk })}
              </Badge>
            </div>
          </div>

          {card.badges.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                {t("pages.healthCard.badges")}
              </p>
              <BadgeDisplay badges={card.badges} max={8} size="md" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: t("pages.healthCard.loanEligible"), value: formatCurrency(card.loan_eligible_amount) },
              { label: t("pages.healthCard.totalRevenue"), value: formatCurrency(card.revenue) },
              { label: t("pages.healthCard.landArea"), value: `${card.total_land_area} acres (${card.land_count} records)` },
              { label: t("pages.healthCard.crops"), value: String(card.crop_count) },
              { label: t("pages.healthCard.schemesApplied"), value: String(card.schemes_applied) },
              { label: t("pages.healthCard.complaints"), value: String(card.complaints) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3"
              >
                <p className="text-xs text-emerald-600">{item.label}</p>
                <p className="mt-0.5 font-semibold text-emerald-950">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-emerald-500">
            {t("pages.healthCard.generated", { date: formatDate(card.generated_at) })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
