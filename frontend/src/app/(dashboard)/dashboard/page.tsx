"use client";

import { useAuth } from "@/providers/auth-provider";
import {
  AdminDashboardView,
  BankDashboardView,
  BuyerDashboardView,
  FarmerDashboardView,
  GovernmentDashboardView,
} from "@/components/dashboard/role-dashboards";
import { PageSkeleton } from "@/components/ui/skeleton";

const DASHBOARD_BY_ROLE = {
  farmer: FarmerDashboardView,
  buyer: BuyerDashboardView,
  admin: AdminDashboardView,
  government: GovernmentDashboardView,
  bank: BankDashboardView,
} as const;

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <PageSkeleton />;
  }

  const DashboardView = DASHBOARD_BY_ROLE[user.role];

  if (!DashboardView) {
    return <FarmerDashboardView />;
  }

  return <DashboardView />;
}
