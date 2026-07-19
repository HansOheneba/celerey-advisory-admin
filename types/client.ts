export type ClientStatus = "active" | "onboarding" | "review" | "inactive";

export type RiskLevel = "conservative" | "moderate" | "growth" | "aggressive";

export type ClientSubscription =
  | "not_onboarded"
  | "free_trial"
  | "celerey_core";

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  subscription: ClientSubscription;
  /** Assets under advisement */
  aua: number;
  currency: "USD" | "GHS" | "GBP";
  advisorId: string;
  advisorName: string;
  location: string;
  lastContactAt: string;
  nextReviewAt: string;
  joinedAt: string;
  goalsCount: number;
  notes?: string;
};

export type ClientActivity = {
  id: string;
  clientId: string;
  clientName: string;
  type: "review" | "message" | "document" | "goal" | "alert";
  summary: string;
  occurredAt: string;
};

export type DashboardSummary = {
  totalClients: number;
  activeClients: number;
  totalAua: number;
  reviewsDueThisWeek: number;
  onboardingCount: number;
  averageAua: number;
  auaByRisk: Array<{ riskLevel: RiskLevel; value: number }>;
  clientsByStatus: Array<{ status: ClientStatus; count: number }>;
  recentActivity: ClientActivity[];
};
