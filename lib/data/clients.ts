import type {
  Client,
  ClientActivity,
  ClientStatus,
  DashboardSummary,
  RiskLevel,
} from "@/types/client";

/** In-memory seed removed — clients come from admin.clients.find. */
export const clients: Client[] = [];

export const clientActivity: ClientActivity[] = [];

export function createClientRecord(input: {
  firstName: string;
  lastName: string;
  email: string;
  advisorId: string;
  advisorName: string;
}): Client {
  const now = new Date();
  const nextReview = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const client: Client = {
    id: `cli_${Date.now().toString(36)}`,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    phone: "",
    status: "onboarding",
    riskLevel: "moderate",
    subscription: "not_onboarded",
    aua: 0,
    currency: "USD",
    advisorId: input.advisorId,
    advisorName: input.advisorName,
    location: "—",
    lastContactAt: now.toISOString(),
    nextReviewAt: nextReview.toISOString(),
    joinedAt: now.toISOString(),
    goalsCount: 0,
  };

  clients.unshift(client);
  return client;
}

export function buildDashboardSummary(rows: Client[]): DashboardSummary {
  const totalAua = rows.reduce((sum, client) => sum + client.aua, 0);
  const riskLevels = [
    "conservative",
    "moderate",
    "growth",
    "aggressive",
  ] as const satisfies readonly RiskLevel[];
  const statuses = [
    "active",
    "onboarding",
    "review",
    "inactive",
  ] as const satisfies readonly ClientStatus[];

  return {
    totalClients: rows.length,
    activeClients: rows.filter((client) => client.status === "active").length,
    totalAua,
    reviewsDueThisWeek: rows.filter((client) => {
      const next = new Date(client.nextReviewAt).getTime();
      const now = Date.now();
      const week = 7 * 24 * 60 * 60 * 1000;
      return next >= now && next <= now + week;
    }).length,
    onboardingCount: rows.filter((client) => client.status === "onboarding")
      .length,
    averageAua: rows.length ? Math.round(totalAua / rows.length) : 0,
    auaByRisk: riskLevels.map((riskLevel) => ({
      riskLevel,
      value: rows
        .filter((client) => client.riskLevel === riskLevel)
        .reduce((sum, client) => sum + client.aua, 0),
    })),
    clientsByStatus: statuses.map((status) => ({
      status,
      count: rows.filter((client) => client.status === status).length,
    })),
    recentActivity: clientActivity,
  };
}
