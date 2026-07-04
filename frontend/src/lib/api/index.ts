import {
  Complaint,
  CropRecord,
  Farmer,
  FarmerDashboard,
  FarmerInsights,
  GovernmentScheme,
  HealthCard,
  LandRecord,
  Listing,
  LoanPrediction,
  LoginResponse,
  Notification,
  PaginatedResponse,
  QuickRegisterPayload,
  QuickRegisterResponse,
  RegisterPayload,
  SchemeApplication,
  SchemeRecommendation,
  Transaction,
  TrustScore,
  TrustScoreSimulatePayload,
  TrustScoreSimulateResult,
  User,
  VillageAnalytics,
} from "@/types";
import { apiClient, authApiClient, clearTokens, setStoredUser, setTokens } from "./client";

export type ListParams = Record<string, string | undefined>;

function qs(params?: ListParams) {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    authApiClient.post<User>("/register/", payload),
  quickRegister: (payload: QuickRegisterPayload) =>
    authApiClient.post<QuickRegisterResponse>("/quick-register/", payload),
  login: async (email: string, password: string) => {
    const { data } = await authApiClient.post<LoginResponse>("/login/", {
      email,
      password,
    });
    setTokens(data.access, data.refresh);
    if (data.user) setStoredUser(data.user);
    return data;
  },
  logout: async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await authApiClient.post("/logout/", { refresh });
    } finally {
      clearTokens();
    }
  },
  refreshProfile: async () => {
    const { data } = await authApiClient.get<User>("/me/");
    setStoredUser(data);
    return data;
  },
};

export const farmersApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Farmer>>(`/farmers/${qs(params)}`),
  get: (id: number) => apiClient.get<Farmer>(`/farmers/${id}/`),
  create: (data: Partial<Farmer>) => apiClient.post<Farmer>("/farmers/", data),
  update: (id: number, data: Partial<Farmer>) =>
    apiClient.patch<Farmer>(`/farmers/${id}/`, data),
};

export const buyersApi = {
  list: () => apiClient.get<PaginatedResponse<import("@/types").Buyer>>("/buyers/"),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.patch(`/buyers/${id}/`, data),
};

export const landsApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<LandRecord>>(`/lands/${qs(params)}`),
  create: (data: FormData | Partial<LandRecord>) =>
    apiClient.post<LandRecord>("/lands/", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),
  update: (id: number, data: Partial<LandRecord>) =>
    apiClient.patch<LandRecord>(`/lands/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/lands/${id}/`),
};

export const cropsApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<CropRecord>>(`/crops/${qs(params)}`),
  create: (data: Partial<CropRecord>) => apiClient.post<CropRecord>("/crops/", data),
  update: (id: number, data: Partial<CropRecord>) =>
    apiClient.patch<CropRecord>(`/crops/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/crops/${id}/`),
};

export const marketplaceApi = {
  listings: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Listing>>(`/listings/${qs(params)}`),
    create: (data: Partial<Listing>) => apiClient.post<Listing>("/listings/", data),
    update: (id: number, data: Partial<Listing>) =>
      apiClient.patch<Listing>(`/listings/${id}/`, data),
  },
  transactions: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Transaction>>(`/transactions/${qs(params)}`),
    create: (data: Partial<Transaction>) =>
      apiClient.post<Transaction>("/transactions/", data),
    update: (id: number, data: Partial<Transaction>) =>
      apiClient.patch<Transaction>(`/transactions/${id}/`, data),
  },
};

export const schemesApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<GovernmentScheme>>(`/schemes/${qs(params)}`),
  applications: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SchemeApplication>>(`/applications/${qs(params)}`),
    create: (scheme: number) =>
      apiClient.post<SchemeApplication>("/applications/", { scheme }),
    update: (id: number, data: Partial<SchemeApplication>) =>
      apiClient.patch<SchemeApplication>(`/applications/${id}/`, data),
  },
};

export const complaintsApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Complaint>>(`/complaints/${qs(params)}`),
  create: (data: FormData) =>
    apiClient.post<Complaint>("/complaints/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, data: Partial<Complaint>) =>
    apiClient.patch<Complaint>(`/complaints/${id}/`, data),
};

export const trustScoreApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<TrustScore>>(`/trust-scores/${qs(params)}`),
  recalculate: () => apiClient.post<TrustScore>("/trust-scores/recalculate/"),
};

export const loansApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<LoanPrediction>>(`/loans/${qs(params)}`),
  calculate: () => apiClient.post<LoanPrediction>("/loans/calculate/"),
};

export const notificationsApi = {
  list: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Notification>>(`/notifications/${qs(params)}`),
  markRead: (id: number) => apiClient.post(`/notifications/${id}/mark-read/`),
  markAllRead: () => apiClient.post("/notifications/mark-all-read/"),
};

export const dashboardApi = {
  farmer: () => apiClient.get<FarmerDashboard>("/dashboard/farmer/"),
  buyer: () => apiClient.get<import("@/types").BuyerDashboard>("/dashboard/buyer/"),
  admin: () => apiClient.get<Record<string, unknown>>("/dashboard/admin/"),
  government: () => apiClient.get<Record<string, unknown>>("/dashboard/government/"),
  bank: () => apiClient.get<Record<string, unknown>>("/dashboard/bank/"),
};

export const aiApi = {
  chat: (message: string, context_type: string) =>
    apiClient.post<{
      available: boolean;
      reply?: string;
      message?: string;
      fallback_tips?: string[];
      context_type?: string;
    }>("/ai/chat/", { message, context_type }),
};

export const insightsApi = {
  get: () => apiClient.get<FarmerInsights>("/farmers/me/insights/"),
  recommendedSchemes: () =>
    apiClient.get<{ recommendations: SchemeRecommendation[] }>("/schemes/recommended/"),
};

export const healthCardApi = {
  get: (farmerId?: number) =>
    apiClient.get<HealthCard>(
      farmerId
        ? `/farmers/me/health-card/?farmer_id=${farmerId}`
        : "/farmers/me/health-card/"
    ),
};

export const trustScoreSimulateApi = {
  simulate: (payload: TrustScoreSimulatePayload) =>
    apiClient.post<{
      simulated: TrustScoreSimulateResult;
      current: {
        total_score: number;
        category: string;
        breakdown: Record<string, number>;
      } | null;
    }>("/trust-scores/simulate/", payload),
};

export const villageAnalyticsApi = {
  get: (village?: string) =>
    apiClient.get<VillageAnalytics>(
      village
        ? `/dashboard/village/?village=${encodeURIComponent(village)}`
        : "/dashboard/village/"
    ),
};

export async function fetchPaginated<T>(url: string) {
  const { data } = await apiClient.get<PaginatedResponse<T>>(url);
  return data.results;
}

export const quickRegister = (payload: QuickRegisterPayload) =>
  authApi.quickRegister(payload);

export { healthCardApi as healthCard };
export { trustScoreSimulateApi as simulateTrustScore };
export { villageAnalyticsApi as villageAnalytics };
