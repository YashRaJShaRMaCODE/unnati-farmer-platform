import { UserRole } from "@/types";

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  farmer: [
    "/dashboard",
    "/profile",
    "/lands",
    "/crops",
    "/marketplace",
    "/schemes",
    "/complaints",
    "/trust-score",
    "/trust-simulator",
    "/health-card",
    "/loan-eligibility",
    "/notifications",
    "/ai-assistant",
  ],
  buyer: ["/dashboard", "/profile", "/marketplace", "/notifications", "/ai-assistant"],
  government: [
    "/dashboard",
    "/schemes",
    "/complaints",
    "/village-analytics",
    "/notifications",
    "/ai-assistant",
  ],
  bank: [
    "/dashboard",
    "/trust-score",
    "/trust-simulator",
    "/loan-eligibility",
    "/village-analytics",
    "/notifications",
    "/ai-assistant",
  ],
  admin: [
    "/dashboard",
    "/profile",
    "/lands",
    "/crops",
    "/marketplace",
    "/schemes",
    "/complaints",
    "/trust-score",
    "/trust-simulator",
    "/health-card",
    "/village-analytics",
    "/loan-eligibility",
    "/notifications",
    "/ai-assistant",
  ],
};

export function canAccessRoute(role: UserRole, path: string): boolean {
  const allowed = ROLE_ROUTES[role] || [];
  return allowed.some((r) => path === r || path.startsWith(r + "/"));
}

export const COMPLAINT_STEPS = [
  "submitted",
  "under_review",
  "investigation",
  "resolved",
] as const;
