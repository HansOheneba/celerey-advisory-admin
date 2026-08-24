import "server-only";

import { executeApi } from "@/lib/api/execute";
import type {
  ClientActivity,
  ClientStatus,
  DashboardSummary,
  RiskLevel,
} from "@/types/client";

const RISK_LEVELS: RiskLevel[] = [
  "conservative",
  "moderate",
  "growth",
  "aggressive",
];

const CLIENT_STATUSES: ClientStatus[] = [
  "active",
  "onboarding",
  "review",
  "inactive",
];

const ACTIVITY_TYPES = new Set([
  "review",
  "message",
  "document",
  "goal",
  "alert",
]);

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeActivity(row: Record<string, unknown>): ClientActivity | null {
  const type = asString(row.type);
  if (!ACTIVITY_TYPES.has(type)) {
    return null;
  }

  return {
    id: asString(row.id),
    clientId: asString(row.clientId ?? row.client_id),
    clientName: asString(row.clientName ?? row.client_name),
    type: type as ClientActivity["type"],
    summary: asString(row.summary),
    occurredAt: asString(row.occurredAt ?? row.occurred_at),
  };
}

export function normalizeDashboardSummary(
  raw: Record<string, unknown>,
): DashboardSummary {
  const auaByRiskRaw = Array.isArray(raw.auaByRisk)
    ? raw.auaByRisk
    : Array.isArray(raw.aua_by_risk)
      ? raw.aua_by_risk
      : [];

  const clientsByStatusRaw = Array.isArray(raw.clientsByStatus)
    ? raw.clientsByStatus
    : Array.isArray(raw.clients_by_status)
      ? raw.clients_by_status
      : [];

  const recentActivityRaw = Array.isArray(raw.recentActivity)
    ? raw.recentActivity
    : Array.isArray(raw.recent_activity)
      ? raw.recent_activity
      : [];

  const auaByRisk = RISK_LEVELS.map((riskLevel) => {
    const match = auaByRiskRaw.find((row) => {
      if (!row || typeof row !== "object") return false;
      const record = row as Record<string, unknown>;
      return asString(record.riskLevel ?? record.risk_level) === riskLevel;
    }) as Record<string, unknown> | undefined;

    return {
      riskLevel,
      value: asNumber(match?.value),
    };
  });

  const clientsByStatus = CLIENT_STATUSES.map((status) => {
    const match = clientsByStatusRaw.find((row) => {
      if (!row || typeof row !== "object") return false;
      const record = row as Record<string, unknown>;
      return asString(record.status) === status;
    }) as Record<string, unknown> | undefined;

    return {
      status,
      count: asNumber(match?.count),
    };
  });

  const recentActivity = recentActivityRaw
    .filter((row): row is Record<string, unknown> =>
      Boolean(row && typeof row === "object"),
    )
    .map(normalizeActivity)
    .filter((row): row is ClientActivity => row !== null);

  return {
    totalClients: asNumber(raw.totalClients ?? raw.total_clients),
    activeClients: asNumber(raw.activeClients ?? raw.active_clients),
    totalAua: asNumber(raw.totalAua ?? raw.total_aua),
    reviewsDueThisWeek: asNumber(
      raw.reviewsDueThisWeek ?? raw.reviews_due_this_week,
    ),
    onboardingCount: asNumber(raw.onboardingCount ?? raw.onboarding_count),
    averageAua: asNumber(raw.averageAua ?? raw.average_aua),
    auaByRisk,
    clientsByStatus,
    recentActivity,
  };
}

export type AdvisorWorkloadRow = {
  advisorId: string;
  advisorName: string;
  clientCount: number;
  activeClientCount: number;
};

export async function getDashboardSummaryApi(accessToken: string) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.dashboard.summary",
    {
      method: "GET",
      accessToken,
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeDashboardSummary(result.data),
  };
}

export async function getAdvisorWorkloadApi(accessToken: string) {
  const result = await executeApi<{
    items?: Array<Record<string, unknown>>;
  }>("admin.reports.workload", {
    method: "GET",
    accessToken,
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];

  return {
    ok: true as const,
    status: result.status,
    data: {
      items: items.map((row) => ({
        advisorId: asString(row.advisorId ?? row.advisor_id),
        advisorName: asString(row.advisorName ?? row.advisor_name),
        clientCount: asNumber(row.clientCount ?? row.client_count),
        activeClientCount: asNumber(
          row.activeClientCount ?? row.active_client_count,
        ),
      })) satisfies AdvisorWorkloadRow[],
    },
  };
}
