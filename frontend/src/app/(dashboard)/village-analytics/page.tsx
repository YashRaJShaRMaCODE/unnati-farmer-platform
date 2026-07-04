"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Crown, MapPin, Users } from "lucide-react";
import { villageAnalyticsApi } from "@/lib/api";
import { PageHeader, ErrorState } from "@/components/shared/page-shell";
import { StatCard } from "@/components/shared/stat-card";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VillageAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["village-analytics"],
    queryFn: async () => (await villageAnalyticsApi.get()).data,
  });

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message="Failed to load village analytics" onRetry={() => refetch()} />;
  if (!data) return null;

  const chartData = data.villages.map((v) => ({
    name: v.village.length > 12 ? `${v.village.slice(0, 12)}…` : v.village,
    fullName: v.village,
    trust: v.average_trust_score,
    farmers: v.total_farmers,
  }));

  const top = data.top_performing_village;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Village Analytics"
        description="Regional performance across villages — trust scores, farmers, and activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Villages"
          value={data.total_villages}
          icon={MapPin}
        />
        <StatCard
          title="Total Farmers"
          value={data.summary.total_farmers}
          icon={Users}
        />
        <StatCard
          title="Avg Trust Score"
          value={data.summary.average_trust_score}
          subtitle="Platform-wide average"
        />
        <StatCard
          title="Total Schemes"
          value={data.summary.total_schemes}
          subtitle={`${data.summary.total_complaints} complaints`}
        />
      </div>

      {top && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-5 w-5 text-amber-600" />
              Top Performing Village
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-emerald-950">{top.village}</p>
                <p className="text-sm text-emerald-700">
                  {top.total_farmers} farmers · {top.verified_farmers} verified
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-700">{top.average_trust_score}</p>
                <p className="text-xs text-emerald-600">avg trust score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Average Trust Score by Village</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }}
                formatter={(value, name) => [value, name === "trust" ? "Trust Score" : "Farmers"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullName || ""
                }
              />
              <Bar dataKey="trust" fill="#059669" name="trust" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Village Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 text-left text-emerald-600">
                  <th className="pb-2 pr-4 font-medium">Village</th>
                  <th className="pb-2 pr-4 font-medium">Farmers</th>
                  <th className="pb-2 pr-4 font-medium">Trust</th>
                  <th className="pb-2 pr-4 font-medium">Verified</th>
                  <th className="pb-2 font-medium">Loans</th>
                </tr>
              </thead>
              <tbody>
                {data.villages.map((v) => (
                  <tr key={v.village} className="border-b border-emerald-50">
                    <td className="py-2.5 pr-4 font-medium text-emerald-950">{v.village}</td>
                    <td className="py-2.5 pr-4">{v.total_farmers}</td>
                    <td className="py-2.5 pr-4">{v.average_trust_score}</td>
                    <td className="py-2.5 pr-4">{v.verified_farmers}</td>
                    <td className="py-2.5">{v.total_loans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
