import "server-only";

import { executeApi } from "@/lib/api/execute";
import type {
  Client,
  ClientStatus,
  ClientSubscription,
  RiskLevel,
} from "@/types/client";

export type CreateClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  sendInvite?: boolean;
  grantCore?: boolean;
  /** Celerey Core access length in days. Only applied when grantCore is true. */
  durationDays?: number;
};

export type CreateClientResult = {
  client: Client;
  invite?: {
    sent?: boolean;
    inviteId?: string | null;
    expiresAt?: string | null;
    onboardingUrl?: string | null;
  } | null;
};

export type InviteClientResult = {
  inviteId: string | null;
  clientId: string;
  email: string;
  status: "sent" | "already_onboarded" | "queued" | string;
  expiresAt: string | null;
  onboardingUrl: string | null;
};

export type FindClientsParams = {
  query?: string;
  status?: string;
  riskLevel?: string;
  subscription?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export type FindClientsResult = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type ApiClientRow = Partial<Client> & {
  id?: string;
  first_name?: string;
  last_name?: string;
  advisor_id?: string;
  advisor_name?: string;
  risk_level?: string;
  last_contact_at?: string | null;
  next_review_at?: string | null;
  joined_at?: string;
  goals_count?: number;
};

const CLIENT_STATUSES = new Set<ClientStatus>([
  "active",
  "onboarding",
  "review",
  "inactive",
]);

const RISK_LEVELS = new Set<RiskLevel>([
  "conservative",
  "moderate",
  "growth",
  "aggressive",
]);

const SUBSCRIPTIONS = new Set<ClientSubscription>([
  "not_onboarded",
  "free_trial",
  "celerey_core",
]);

const CURRENCIES = new Set(["USD", "GHS", "GBP"]);

function asClientStatus(value: unknown): ClientStatus {
  return CLIENT_STATUSES.has(value as ClientStatus)
    ? (value as ClientStatus)
    : "onboarding";
}

function asRiskLevel(value: unknown): RiskLevel {
  return RISK_LEVELS.has(value as RiskLevel)
    ? (value as RiskLevel)
    : "moderate";
}

function asSubscription(value: unknown): ClientSubscription {
  return SUBSCRIPTIONS.has(value as ClientSubscription)
    ? (value as ClientSubscription)
    : "not_onboarded";
}

function asCurrency(value: unknown): Client["currency"] {
  return CURRENCIES.has(value as string)
    ? (value as Client["currency"])
    : "USD";
}

/** Normalize API client rows (camelCase or snake_case) into our Client shape. */
export function normalizeClient(row: ApiClientRow): Client {
  const emptyDate = "";

  return {
    id: String(row.id ?? ""),
    firstName: String(row.firstName ?? row.first_name ?? ""),
    lastName: String(row.lastName ?? row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: asClientStatus(row.status),
    riskLevel: asRiskLevel(row.riskLevel ?? row.risk_level),
    subscription: asSubscription(row.subscription),
    aua: typeof row.aua === "number" ? row.aua : Number(row.aua ?? 0) || 0,
    currency: asCurrency(row.currency),
    advisorId: String(row.advisorId ?? row.advisor_id ?? ""),
    advisorName: String(row.advisorName ?? row.advisor_name ?? ""),
    location: String(row.location ?? "—"),
    lastContactAt: String(
      row.lastContactAt ?? row.last_contact_at ?? emptyDate,
    ),
    nextReviewAt: String(row.nextReviewAt ?? row.next_review_at ?? emptyDate),
    joinedAt: String(row.joinedAt ?? row.joined_at ?? emptyDate),
    goalsCount:
      typeof row.goalsCount === "number"
        ? row.goalsCount
        : Number(row.goals_count ?? 0) || 0,
    notes: row.notes,
  };
}

export async function createClientApi(
  accessToken: string,
  input: CreateClientInput,
) {
  const body = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    sendInvite: input.sendInvite ?? true,
    grantCore: input.grantCore ?? true,
    ...(input.grantCore && input.durationDays
      ? { duration: input.durationDays }
      : {}),
  };

  console.log("[admin.clients.create] payload:", JSON.stringify(body, null, 2));

  return executeApi<CreateClientResult>("admin.clients.create", {
    method: "POST",
    accessToken,
    body,
  });
}

export async function findClientsApi(
  accessToken: string,
  params: FindClientsParams = {},
) {
  const result = await executeApi<{
    items?: ApiClientRow[];
    total?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
  }>("admin.clients.find", {
    method: "GET",
    accessToken,
    searchParams: {
      query: params.query,
      status: params.status ?? "all",
      riskLevel: params.riskLevel ?? "all",
      subscription: params.subscription ?? "all",
      sortBy: params.sortBy ?? "name",
      sortDir: params.sortDir ?? "asc",
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    },
  });

  if (!result.ok) {
    return result;
  }

  const raw = result.data;
  const items = Array.isArray(raw.items) ? raw.items : [];
  const page = typeof raw.page === "number" ? raw.page : 1;
  const pageSize =
    typeof raw.pageSize === "number" ? raw.pageSize : (params.pageSize ?? 10);
  const total = typeof raw.total === "number" ? raw.total : items.length;
  const pageCount =
    typeof raw.pageCount === "number"
      ? raw.pageCount
      : Math.max(1, Math.ceil(total / pageSize));

  return {
    ok: true as const,
    status: result.status,
    data: {
      items: items.map((row) => normalizeClient(row)),
      total,
      page,
      pageSize,
      pageCount,
    } satisfies FindClientsResult,
  };
}

export async function inviteClientApi(
  accessToken: string,
  clientId: string,
  channel: "email" = "email",
) {
  return executeApi<InviteClientResult>("admin.clients.invite", {
    method: "POST",
    accessToken,
    body: {
      client_id: clientId,
      channel,
    },
  });
}
