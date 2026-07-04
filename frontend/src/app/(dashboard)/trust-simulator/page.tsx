"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { trustScoreSimulateApi } from "@/lib/api";
import {
  SCORE_MAX,
  simulateTrustScore,
  TrustScoreComponents,
} from "@/lib/trust-score-engine";
import { getApiErrorMessage } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-shell";
import { CircularScore } from "@/components/shared/visual-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SLIDER_CONFIG = [
  { key: "verification_score" as const, label: "Verification", max: SCORE_MAX.verification },
  { key: "transaction_score" as const, label: "Transactions", max: SCORE_MAX.transaction },
  { key: "buyer_rating_score" as const, label: "Buyer Rating", max: SCORE_MAX.buyer_rating },
  { key: "government_score" as const, label: "Government", max: SCORE_MAX.government },
  { key: "complaint_score" as const, label: "Complaints", max: SCORE_MAX.complaint },
];

const DEFAULT_SCORES: TrustScoreComponents = {
  verification_score: 10,
  transaction_score: 12,
  buyer_rating_score: 10,
  government_score: 6,
  complaint_score: 12,
};

function categoryVariant(category: string) {
  switch (category) {
    case "Excellent":
    case "Good":
      return "success" as const;
    case "Average":
      return "warning" as const;
    default:
      return "danger" as const;
  }
}

export default function TrustSimulatorPage() {
  const [scores, setScores] = useState<TrustScoreComponents>(DEFAULT_SCORES);
  const [currentScore, setCurrentScore] = useState<{
    total_score: number;
    category: string;
    breakdown: Record<string, number>;
  } | null>(null);

  const localSimulated = useMemo(() => simulateTrustScore(scores), [scores]);

  const simulateMutation = useMutation({
    mutationFn: () => trustScoreSimulateApi.simulate(scores),
    onSuccess: (res) => {
      setCurrentScore(res.data.current);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Simulation failed")),
  });

  useEffect(() => {
    simulateMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comparisonData = SLIDER_CONFIG.map(({ key, label }) => ({
    name: label,
    current: currentScore?.breakdown[key] ?? 0,
    simulated: localSimulated[key],
  }));

  const updateScore = (key: keyof TrustScoreComponents, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Trust Score Simulator"
        description="Adjust score components to see how your trust score would change"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4" />
              Score Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {SLIDER_CONFIG.map(({ key, label, max }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-emerald-900">{label}</span>
                  <span className="text-emerald-600">
                    {scores[key]} / {max}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={scores[key]}
                  onChange={(e) => updateScore(key, Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-emerald-600"
                />
              </div>
            ))}
            <Button
              className="w-full"
              onClick={() => simulateMutation.mutate()}
              disabled={simulateMutation.isPending}
            >
              {simulateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Simulating...
                </>
              ) : (
                "Sync with Server"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-sm text-emerald-600">
                Current Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              {currentScore ? (
                <>
                  <CircularScore score={currentScore.total_score} label={currentScore.category} />
                  <Badge variant={categoryVariant(currentScore.category)} className="mt-3">
                    {currentScore.category}
                  </Badge>
                </>
              ) : (
                <p className="py-8 text-sm text-emerald-600">
                  No trust score calculated yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/30 hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-sm text-emerald-600">
                Simulated Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <CircularScore
                score={localSimulated.total_score}
                label={localSimulated.category}
              />
              <Badge variant={categoryVariant(localSimulated.category)} className="mt-3">
                {localSimulated.category}
              </Badge>
              {currentScore && (
                <p className="mt-2 text-xs text-emerald-700">
                  {localSimulated.total_score >= currentScore.total_score ? "+" : ""}
                  {localSimulated.total_score - currentScore.total_score} vs current
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
              <Legend />
              <Bar dataKey="current" fill="#94a3b8" name="Current" radius={[4, 4, 0, 0]} />
              <Bar dataKey="simulated" fill="#059669" name="Simulated" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
