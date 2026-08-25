import "server-only";

import {
  normalizeClient,
  normalizeClientDetail,
  type ApiClientRow,
  type RawClientDetail,
} from "@/lib/api/client-mappers";
import { executeApi } from "@/lib/api/execute";
import type { Client, ClientSubscription } from "@/types/client";

export { normalizeClient };

export type CreateClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  sendInvite?: boolean;
  grantCore?: boolean;
  /** Celerey Core access length in days. Only applied when grantCore is true. */
  durationDays?: number;
  advisorId?: string;
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
  advisorId?: string;
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
    ...(input.advisorId ? { advisor_id: input.advisorId } : {}),
  };

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
      advisor_id: params.advisorId,
      sortBy: params.sortBy ?? "name",
      sortDir: params.sortDir ?? "asc",
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });

  if (!result.ok) {
    return result;
  }

  const raw = result.data;
  const items = Array.isArray(raw.items) ? raw.items : [];
  const page = typeof raw.page === "number" ? raw.page : 1;
  const pageSize =
    typeof raw.pageSize === "number" ? raw.pageSize : (params.pageSize ?? 20);
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

export async function clientDetailApi(accessToken: string, clientId: string) {
  const result = await executeApi<RawClientDetail>("admin.clients.detail", {
    method: "GET",
    accessToken,
    searchParams: { client_id: clientId },
  });

  if (!result.ok) {
    console.log(
      `[admin.clients.detail] failed for ${clientId} (${result.status}):`,
      result.message,
    );
    return result;
  }

  console.log(
    `[admin.clients.detail] raw response for ${clientId}:`,
    JSON.stringify(result.data, null, 2),
  );

  return {
    ok: true as const,
    status: result.status,
    data: normalizeClientDetail(result.data),
  };
}

export async function updateClientSubscriptionApi(
  accessToken: string,
  input: {
    clientId: string;
    subscription: ClientSubscription;
    durationDays?: number;
    reason?: string;
  },
) {
  return executeApi<{ clientId: string; subscription: string }>(
    "admin.clients.update-subscription",
    {
      method: "PUT",
      accessToken,
      body: {
        client_id: input.clientId,
        subscription: input.subscription,
        ...(input.subscription === "celerey_core" && input.durationDays
          ? { duration: input.durationDays }
          : {}),
        ...(input.reason ? { reason: input.reason } : {}),
      },
    },
  );
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

export async function assignClientAdvisorApi(
  accessToken: string,
  input: {
    clientId: string;
    advisorId: string | null;
  },
) {
  return executeApi<{ clientId: string; advisorId: string | null }>(
    "admin.clients.assign-advisor",
    {
      method: "PUT",
      accessToken,
      body: {
        client_id: input.clientId,
        advisor_id: input.advisorId,
      },
    },
  );
}
