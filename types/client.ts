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
  /** Total assets under advice (includes managed; AUA >= AUM). */
  aua: number;
  /** Managed subset of AUA. */
  aum: number;
  currency: "USD" | "GHS" | "GBP";
  advisorId: string;
  advisorName: string;
  location: string;
  lastContactAt: string;
  /** What last updated lastContactAt — see lib/clients/contact-tracking.ts */
  lastContactSource?:
    | "message"
    | "session_logged"
    | "onboarding"
    | "seed"
    | null;
  /** Days between scheduled reviews for this client. */
  reviewFrequencyDays: number;
  nextReviewAt: string;
  joinedAt: string;
  goalsCount: number;
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
