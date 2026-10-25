"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Bell,
  CreditCard,
  Leaf,
  Map,
  Shield,
  ShoppingCart,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { dashboardApi, insightsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { ProfileCompletionWidget } from "@/components/shared/profile-completion-widget";
import { ActivityTimelineWidget } from "@/components/shared/activity-timeline-widget";
import { AchievementGrid } from "@/components/shared/achievement-grid";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircularScore } from "@/components/shared/visual-components";
import { useTranslation } from "@/providers/language-provider";
import {
  translateLoanRecommendation,
  translateRiskLabel,
  translateTransactionStatus,
  translateTrustBreakdownLabel,
  translateTrustCategory,
} from "@/lib/i18n/dashboard-helpers";

const CHART_COLORS = [
  "#059669",
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#3b82f6",
];

function dictToChartData(dict: Record<string, number> | undefined) {
  if (!dict) return [];
  return Object.entries(dict).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));
}

function useDashboardError(isError: boolean, message?: string) {
  useEffect(() => {
    if (isError) {
      toast.error(message || "Failed to load dashboard data");
    }
  }, [isError, message]);
}

interface AdminDashboard {
  total_users: number;
  users_by_role: Record<string, number>;
  total_farmers: number;
  verified_farmers: number;
  total_buyers: number;
  total_land_records: number;
  total_crops: number;
  active_listings: number;
  total_transactions: number;
  completed_transactions: number;
  transaction_volume: number;
  active_schemes: number;
  scheme_applications: number;
  pending_complaints: number;
  average_trust_score: number;
  loan_predictions: number;
  platform_health: number;
}

interface GovernmentDashboard {
  active_schemes: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
  pending_applications: number;
  total_complaints: number;
  complaints_by_status: Record<string, number>;
  pending_complaints: number;
  verified_farmers: number;
  total_farmers: number;
}

interface BankDashboard {
  total_farmers: number;
  verified_farmers: number;
  trust_score_distribution: Record<string, number>;
  average_trust_score: number;
  high_risk_farmers: number;
  excellent_farmers: number;
  loan_predictions: number;
  low_risk_loans: number;
  medium_risk_loans: number;
  high_risk_loans: number;
  total_transaction_volume: number;
}

export function FarmerDashboardView() {
  const { locale, t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "farmer"],
    queryFn: async () => (await dashboardApi.farmer()).data,
  });

  const { data: insights } = useQuery({
    queryKey: ["farmer-insights"],
    queryFn: async () => (await insightsApi.get()).data,
  });

  useDashboardError(isError, "Could not load farmer dashboard");

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message={t("pages.dashboard.loadFailed")} onRetry={() => refetch()} />;
  if (!data) return null;

  const chartData = Object.entries(data.trust_score.breakdown).map(([key, value]) => ({
    name: translateTrustBreakdownLabel(locale, key),
    score: value,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.dashboard.farmerTitle")}
        description={t("pages.dashboard.farmerDescription")}
      />

      <section aria-labelledby="farmer-quick-actions">
        <h2 id="farmer-quick-actions" className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-800">
          {t("pages.dashboard.quickActions")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/lands", label: t("pages.dashboard.addLandRecord"), icon: Map },
            { href: "/crops", label: t("pages.dashboard.addCropRecord"), icon: Sprout },
            { href: "/schemes", label: t("pages.dashboard.findSchemes"), icon: Leaf },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-16 items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">{label}</span>
              <span className="text-emerald-500 transition-transform group-hover:translate-x-0.5" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("pages.dashboard.stats.trustScore")}
          value={data.trust_score.total_score}
          subtitle={translateTrustCategory(locale, data.trust_score.category)}
          href="/trust-score"
          icon={Shield}
        />
        <StatCard
          title={t("pages.dashboard.stats.loanEligible")}
          value={formatCurrency(data.loan_eligibility.eligible_amount)}
          subtitle={translateRiskLabel(locale, data.loan_eligibility.risk_category)}
          href="/loan-eligibility"
          icon={CreditCard}
        />
        <StatCard
          title={t("pages.dashboard.stats.totalLand")}
          value={t("pages.dashboard.acres", { area: data.land_summary.total_area })}
          subtitle={t("pages.dashboard.statSubtitles.records", {
            count: data.land_summary.total_records,
          })}
          href="/lands"
          icon={Map}
        />
        <StatCard
          title={t("pages.dashboard.stats.unreadAlerts")}
          value={data.notifications_unread}
          subtitle={t("pages.dashboard.statSubtitles.activeListings", {
            count: data.active_listings,
          })}
          href="/notifications"
          icon={Bell}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("pages.dashboard.stats.activeCrops")}
          value={data.crop_summary.total_crops}
          subtitle={t("pages.dashboard.statSubtitles.totalYield", {
            yield: data.crop_summary.total_yield,
          })}
          href="/crops"
          icon={Sprout}
        />
        <StatCard
          title={t("pages.dashboard.stats.marketplace")}
          value={data.active_listings}
          subtitle={t("pages.dashboard.statSubtitles.activeListingsLabel")}
          href="/marketplace"
          icon={ShoppingCart}
        />
        <StatCard
          title={t("pages.dashboard.stats.schemeApplications")}
          value={data.scheme_applications}
          subtitle={t("pages.dashboard.statSubtitles.submittedApplications")}
          href="/schemes"
          icon={Leaf}
        />
        <StatCard
          title={t("pages.dashboard.stats.openComplaints")}
          value={data.open_complaints}
          subtitle={t("pages.dashboard.statSubtitles.awaitingResolution")}
          href="/complaints"
          icon={AlertTriangle}
        />
      </div>

      {insights && (
        <div className="grid gap-6 lg:grid-cols-3">
          <ProfileCompletionWidget data={insights.profile_completion} />
          <div className="lg:col-span-2">
            <ActivityTimelineWidget events={insights.activity_timeline} />
          </div>
        </div>
      )}

      {insights && insights.achievements.length > 0 && (
        <AchievementGrid achievements={insights.achievements} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.dashboard.trustScoreBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 30]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }}
                  formatter={(value) => [value, t("pages.dashboard.score")]}
                />
                <Bar dataKey="score" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pages.dashboard.loanRecommendation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={data.loan_eligibility.risk_category === "low" ? "success" : "warning"}>
              {translateRiskLabel(locale, data.loan_eligibility.risk_category)}
            </Badge>
            <p className="mt-4 text-sm leading-relaxed text-emerald-800">
              {translateLoanRecommendation(
                locale,
                data.loan_eligibility.risk_category,
                data.loan_eligibility.recommendation
              )}
            </p>
            <Link
              href="/loan-eligibility"
              className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              {t("pages.dashboard.viewLoanDetails")}
            </Link>
          </CardContent>
        </Card>
      </div>

      {(() => {
        const schemes =
          insights?.scheme_recommendations?.length
            ? insights.scheme_recommendations
            : data.scheme_recommendations || [];
        if (schemes.length === 0) return null;
        return (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-emerald-950">
              {t("pages.dashboard.recommendedSchemes")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schemes.map((scheme) => (
                <Link
                  key={"scheme_id" in scheme ? scheme.scheme_id : scheme.id}
                  href="/schemes"
                >
                  <Card className="h-full transition-all hover:border-emerald-300 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{scheme.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-emerald-700">{scheme.description}</p>
                      <p className="mt-3 text-sm font-semibold text-emerald-600">
                        {t("pages.dashboard.benefit")} {formatCurrency(scheme.benefit_amount)}
                      </p>
                      {"match_score" in scheme && (
                        <p className="mt-1 text-xs text-emerald-500">
                          {t("pages.dashboard.match", { percent: scheme.match_score })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("pages.dashboard.recentActivity")}</CardTitle>
          <Link href="/marketplace" className="text-sm font-medium text-emerald-700 hover:underline">
            {t("pages.dashboard.viewMarketplace")}
          </Link>
        </CardHeader>
        <CardContent>
          {data.recent_transactions.length === 0 ? (
            <EmptyState
              title={t("pages.dashboard.noTransactions")}
              description={t("pages.dashboard.listCropsDesc")}
              actionLabel={t("pages.dashboard.goToMarketplace")}
              href="/marketplace"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.crop")}</TableHead>
                  <TableHead>{t("pages.marketplace.buyer")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent_transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.crop}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{txn.buyer}</TableCell>
                    <TableCell>{formatCurrency(txn.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={txn.status === "completed" ? "success" : "warning"}>
                        {translateTransactionStatus(locale, txn.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(txn.date)}</TableCell>
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

export function BuyerDashboardView() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "buyer"],
    queryFn: async () => (await dashboardApi.buyer()).data,
  });

  useDashboardError(isError, "Could not load buyer dashboard");

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message={t("pages.dashboard.loadFailed")} onRetry={() => refetch()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.dashboard.buyerTitle")}
        description={t("pages.dashboard.buyerDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Listings"
          value={data.active_listings_count}
          subtitle="Available on marketplace"
          href="/marketplace"
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Purchases"
          value={data.total_purchases}
          subtitle={`${data.completed_purchases} completed`}
          href="/marketplace"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(data.total_spent)}
          subtitle="Completed transactions"
          href="/marketplace"
        />
        <StatCard
          title="Unread Alerts"
          value={data.notifications_unread}
          href="/notifications"
          icon={Bell}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-emerald-950">Featured Listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-emerald-700 hover:underline">
            Browse all
          </Link>
        </div>
        {data.featured_listings.length === 0 ? (
          <EmptyState
            title="No listings available"
            description="Check back soon for fresh crop listings from verified farmers."
            actionLabel="View Marketplace"
            href="/marketplace"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.featured_listings.map((listing) => (
              <Link key={listing.id} href="/marketplace">
                <Card className="h-full transition-all hover:border-emerald-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{listing.crop}</CardTitle>
                      <Badge variant={listing.status === "active" ? "success" : "default"}>
                        {listing.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-emerald-700">Farmer: {listing.farmer}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-emerald-600">{listing.quantity} units</span>
                      <span className="font-semibold text-emerald-950">
                        {formatCurrency(listing.price_per_unit)}/unit
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {data.purchase_history.length === 0 ? (
              <p className="py-6 text-center text-sm text-emerald-600">No purchases yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.purchase_history.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.crop}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{purchase.farmer}</TableCell>
                      <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === "completed" ? "success" : "warning"}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trusted Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.trusted_farmers.length === 0 ? (
              <p className="py-6 text-center text-sm text-emerald-600">
                Complete purchases to build your trusted farmer network
              </p>
            ) : (
              <div className="space-y-3">
                {data.trusted_farmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-emerald-950">{farmer.name}</p>
                      <p className="text-xs text-emerald-600">{farmer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-700">{farmer.trust_score}</p>
                      <p className="text-xs capitalize text-emerald-600">{farmer.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => (await dashboardApi.admin()).data as unknown as AdminDashboard,
  });

  useDashboardError(isError, "Could not load admin dashboard");

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message="Failed to load platform analytics." onRetry={() => refetch()} />;
  if (!data) return null;

  const usersByRole = dictToChartData(data.users_by_role);
  const keyMetrics = [
    { name: "Farmers", value: data.total_farmers },
    { name: "Buyers", value: data.total_buyers },
    { name: "Listings", value: data.active_listings },
    { name: "Transactions", value: data.total_transactions },
    { name: "Schemes", value: data.active_schemes },
    { name: "Complaints", value: data.pending_complaints },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.dashboard.adminTitle")}
        description={t("pages.dashboard.adminDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={data.total_users} icon={Users} href="/dashboard" />
        <StatCard
          title="Verified Farmers"
          value={`${data.verified_farmers}/${data.total_farmers}`}
          subtitle="Verification rate"
          href="/trust-score"
          icon={Shield}
        />
        <StatCard
          title="Transaction Volume"
          value={formatCurrency(data.transaction_volume)}
          subtitle={`${data.completed_transactions} completed`}
          href="/marketplace"
          icon={TrendingUp}
        />
        <StatCard
          title="Pending Complaints"
          value={data.pending_complaints}
          href="/complaints"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersByRole}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {usersByRole.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keyMetrics} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <CircularScore score={data.platform_health} label="Health Index" />
            <p className="mt-4 text-center text-sm text-emerald-700">
              Composite score from verification, transactions, trust, and complaint resolution
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Land Records" value={data.total_land_records} href="/lands" icon={Map} />
        <StatCard title="Crop Records" value={data.total_crops} href="/crops" icon={Sprout} />
        <StatCard
          title="Scheme Applications"
          value={data.scheme_applications}
          href="/schemes"
          icon={Leaf}
        />
        <StatCard
          title="Loan Predictions"
          value={data.loan_predictions}
          subtitle={`Avg trust: ${Math.round(data.average_trust_score)}`}
          href="/loan-eligibility"
          icon={CreditCard}
        />
      </div>
    </div>
  );
}

export function GovernmentDashboardView() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "government"],
    queryFn: async () => (await dashboardApi.government()).data as unknown as GovernmentDashboard,
  });

  useDashboardError(isError, "Could not load government dashboard");

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message="Failed to load government analytics." onRetry={() => refetch()} />;
  if (!data) return null;

  const applicationsChart = dictToChartData(data.applications_by_status);
  const complaintsChart = dictToChartData(data.complaints_by_status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.dashboard.governmentTitle")}
        description={t("pages.dashboard.governmentDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pending Applications"
          value={data.pending_applications}
          subtitle={`${data.total_applications} total`}
          href="/schemes"
          icon={Leaf}
        />
        <StatCard
          title="Pending Complaints"
          value={data.pending_complaints}
          subtitle={`${data.total_complaints} total`}
          href="/complaints"
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Schemes"
          value={data.active_schemes}
          href="/schemes"
        />
        <StatCard
          title="Verified Farmers"
          value={`${data.verified_farmers}/${data.total_farmers}`}
          subtitle="Platform verification"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applications by Status</CardTitle>
            <Link href="/schemes" className="text-sm font-medium text-emerald-700 hover:underline">
              Review queue →
            </Link>
          </CardHeader>
          <CardContent className="h-72">
            {applicationsChart.length === 0 ? (
              <EmptyState title="No applications" description="No scheme applications recorded yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationsChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {applicationsChart.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Complaints by Status</CardTitle>
            <Link href="/complaints" className="text-sm font-medium text-emerald-700 hover:underline">
              Review queue →
            </Link>
          </CardHeader>
          <CardContent className="h-72">
            {complaintsChart.length === 0 ? (
              <EmptyState title="No complaints" description="No complaints recorded yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintsChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {complaintsChart.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function BankDashboardView() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "bank"],
    queryFn: async () => (await dashboardApi.bank()).data as unknown as BankDashboard,
  });

  useDashboardError(isError, "Could not load bank dashboard");

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message="Failed to load lending analytics." onRetry={() => refetch()} />;
  if (!data) return null;

  const trustDistribution = dictToChartData(data.trust_score_distribution);
  const loanRiskData = [
    { name: "Low Risk", count: data.low_risk_loans },
    { name: "Medium Risk", count: data.medium_risk_loans },
    { name: "High Risk", count: data.high_risk_loans },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.dashboard.bankTitle")}
        description={t("pages.dashboard.bankDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Farmers"
          value={data.total_farmers}
          subtitle={`${data.verified_farmers} verified`}
          href="/trust-score"
          icon={Users}
        />
        <StatCard
          title="Avg Trust Score"
          value={Math.round(data.average_trust_score)}
          href="/trust-score"
          icon={Shield}
        />
        <StatCard
          title="Excellent Farmers"
          value={data.excellent_farmers}
          subtitle={`${data.high_risk_farmers} high risk`}
          href="/trust-score"
        />
        <StatCard
          title="Loan Predictions"
          value={data.loan_predictions}
          href="/loan-eligibility"
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trust Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {trustDistribution.length === 0 ? (
              <EmptyState title="No trust data" description="Trust scores have not been calculated yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trustDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {trustDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Risk Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanRiskData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {loanRiskData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Low Risk"
                          ? "#059669"
                          : entry.name === "Medium Risk"
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <StatCard
        title="Total Transaction Volume"
        value={formatCurrency(data.total_transaction_volume)}
        subtitle="Completed marketplace transactions"
        href="/loan-eligibility"
        className="max-w-md"
      />
    </div>
  );
}
