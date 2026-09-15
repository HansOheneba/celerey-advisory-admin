export type ClientStatus = "active" | "onboarding" | "review" | "inactive";

export type RiskLevel = "conservative" | "moderate" | "growth" | "aggressive";

export type ClientSubscription =
  | "not_onboarded"
  | "free_trial"
  | "celerey_core";

/** Wealth segment — drives service tier and review cadence. */
export type ClientSegment =
  | "emerging"
  | "prestige"
  | "mass_affluent"
  | "ultra";

export const CLIENT_SEGMENT_LABELS: Record<ClientSegment, string> = {
  emerging: "Emerging",
  prestige: "Prestige",
  mass_affluent: "Mass Affluent",
  ultra: "Ultra",
};

export const CLIENT_SEGMENTS: ClientSegment[] = [
  "emerging",
  "prestige",
  "mass_affluent",
  "ultra",
];

const LEGACY_CLIENT_SEGMENT: Record<string, ClientSegment> = {
  emerging: "emerging",
  prestige: "prestige",
  mass_affluent: "mass_affluent",
  ultra: "ultra",
  affluent: "mass_affluent",
  hnw: "prestige",
  uhnw: "ultra",
};

export function normalizeClientSegment(value: unknown): ClientSegment {
  if (typeof value === "string" && value in LEGACY_CLIENT_SEGMENT) {
    return LEGACY_CLIENT_SEGMENT[value];
  }
  return "emerging";
}

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  subscription: ClientSubscription;
  segment: ClientSegment;
  /** Total assets under advisory (includes managed; AUA >= AUM). */
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
