export type UserRole = "farmer" | "buyer" | "government" | "bank" | "admin";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Farmer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  aadhaar_number: string;
  profile_image: string | null;
  address: string;
  experience_years: number;
  verification_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandRecord {
  id: number;
  farmer: number;
  farmer_email: string;
  survey_number: string;
  total_area: string;
  soil_type: string;
  irrigation_type: string;
  location: string;
  ownership_document: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CropRecord {
  id: number;
  farmer: number;
  farmer_email: string;
  crop_name: string;
  season: string;
  area_used: string;
  yield_amount: string;
  harvest_date: string;
  created_at: string;
}

export interface FarmerBadge {
  id: string;
  label: string;
  icon: string;
  tier: "gold" | "silver" | "bronze";
}

export interface ProfileMilestone {
  key: string;
  label: string;
  done: boolean;
}

export interface ProfileCompletion {
  percent: number;
  milestones: ProfileMilestone[];
  reward_badges: string[];
  next_step: string;
}

export interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
}

export interface ActivityEvent {
  type: string;
  title: string;
  date: string;
  icon: string;
}

export interface SchemeRecommendation {
  scheme_id: number;
  name: string;
  description: string;
  benefit_amount: number;
  match_score: number;
  reasons: string[];
}

export interface FarmerInsights {
  profile_completion: ProfileCompletion;
  badges: FarmerBadge[];
  achievements: Achievement[];
  activity_timeline: ActivityEvent[];
  scheme_recommendations: SchemeRecommendation[];
}

export interface HealthCard {
  farmer_name: string;
  village: string;
  phone: string | null;
  email: string;
  trust_score: number;
  trust_category: string;
  badges: FarmerBadge[];
  loan_eligible_amount: number;
  loan_risk: string;
  land_count: number;
  total_land_area: number;
  crop_count: number;
  schemes_applied: number;
  complaints: number;
  revenue: number;
  profile_completion: number;
  generated_at: string;
}

export interface QuickRegisterPayload {
  first_name: string;
  phone_number: string;
  village: string;
  password: string;
}

export interface QuickRegisterResponse {
  message: string;
  user: User;
  login_hint: string;
}

export interface TrustScoreSimulatePayload {
  verification_score: number;
  transaction_score: number;
  buyer_rating_score: number;
  government_score: number;
  complaint_score: number;
}

export interface TrustScoreSimulateResult {
  verification_score: number;
  transaction_score: number;
  buyer_rating_score: number;
  government_score: number;
  complaint_score: number;
  total_score: number;
  category: string;
}

export interface VillageStat {
  village: string;
  total_farmers: number;
  average_trust_score: number;
  verified_farmers: number;
  total_loans: number;
  total_schemes: number;
  complaint_count: number;
}

export interface VillageAnalytics {
  villages: VillageStat[];
  total_villages: number;
  top_performing_village: VillageStat | null;
  summary: {
    total_farmers: number;
    average_trust_score: number;
    total_loans: number;
    total_schemes: number;
    total_complaints: number;
  };
}

export interface Listing {
  id: number;
  farmer: number;
  farmer_email: string;
  farmer_name?: string;
  farmer_village?: string;
  crop: number;
  crop_name: string;
  quantity: string;
  price_per_unit: string;
  description: string;
  status: string;
  created_at: string;
  farmer_trust_score?: number;
  farmer_trust_category?: string;
  farmer_badges?: FarmerBadge[];
  is_verified_farmer?: boolean;
}

export interface Transaction {
  id: number;
  listing: number;
  listing_crop: string;
  buyer: number;
  buyer_email: string;
  farmer_email: string;
  quantity: string;
  total_amount: string;
  status: string;
  transaction_date: string;
}

export interface GovernmentScheme {
  id: number;
  name: string;
  description: string;
  eligibility_criteria: string;
  benefit_amount: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface SchemeApplication {
  id: number;
  farmer: number;
  farmer_email: string;
  scheme: number;
  scheme_name: string;
  status: string;
  applied_at: string;
  remarks: string | null;
}

export interface Complaint {
  id: number;
  farmer: number;
  farmer_email: string;
  title: string;
  description: string;
  evidence: string | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrustScore {
  id: number;
  farmer: number;
  farmer_email: string;
  verification_score: number;
  transaction_score: number;
  buyer_rating_score: number;
  government_score: number;
  complaint_score: number;
  total_score: number;
  category: string;
  calculated_at: string;
}

export interface LoanPrediction {
  id: number;
  farmer: number;
  farmer_email: string;
  trust_score: number;
  land_size: string;
  revenue: string;
  transaction_count: number;
  eligible_amount: string;
  risk_category: string;
  recommendation: string;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface FarmerDashboard {
  trust_score: {
    total_score: number;
    category: string;
    breakdown: Record<string, number>;
  };
  loan_eligibility: {
    eligible_amount: number;
    risk_category: string;
    recommendation: string;
  };
  land_summary: { total_records: number; total_area: number };
  crop_summary: { total_crops: number; total_yield: number };
  notifications_unread: number;
  recent_transactions: Array<{
    id: number;
    crop: string;
    buyer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  active_listings: number;
  scheme_applications: number;
  open_complaints: number;
  scheme_recommendations?: Array<{
    id: number;
    name: string;
    benefit_amount: number;
    description: string;
  }>;
}

export interface Buyer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  phone_number: string | null;
  created_at: string;
}

export interface BuyerDashboard {
  active_listings_count: number;
  total_purchases: number;
  completed_purchases: number;
  total_spent: number;
  notifications_unread: number;
  featured_listings: Array<{
    id: number;
    crop: string;
    farmer: string;
    quantity: number;
    price_per_unit: number;
    status: string;
  }>;
  purchase_history: Array<{
    id: number;
    crop: string;
    farmer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  trusted_farmers: Array<{
    id: number;
    email: string;
    name: string;
    trust_score: number;
    category: string;
  }>;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
  message?: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: UserRole;
}
