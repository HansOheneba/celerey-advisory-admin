import "server-only";

import { cache } from "react";

import {
  assignClientAdvisorApi,
  clientDetailApi,
  findClientsApi,
  updateClientSubscriptionApi,
} from "@/lib/api/clients";
import { getDashboardSummaryApi } from "@/lib/api/dashboard";
import { isAdmin } from "@/lib/auth/roles";
import { buildDashboardSummary } from "@/lib/data/clients";
import {
  assertCanAccessClient,
  requireAdmin,
  requireSession,
  type AdvisorSession,
} from "@/lib/dal";
import type {
  Client,
  ClientSubscription,
  DashboardSummary,
} from "@/types/client";
import type { ClientDetail } from "@/types/client-detail";

export type ClientListParams = {
  query?: string;
  status?: string;
  riskLevel?: string;
  subscription?: string;
  sortBy?: "name" | "aua" | "lastContactAt" | "nextReviewAt";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  /** Limit to the signed-in advisor's book, including for admins. */
  ownBookOnly?: boolean;
};

export type ClientListResult = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function scopedAdvisorId(session: Pick<AdvisorSession, "role" | "userId">) {
  return isAdmin(session.role) ? undefined : session.userId;
}

function filterAssignedClients(
  session: AdvisorSession,
  items: Client[],
  ownBookOnly = false,
) {
  if (isAdmin(session.role) && !ownBookOnly) {
    return items;
  }

  return items.filter((client) => client.advisorId === session.userId);
}

export async function listClients(
  params: ClientListParams = {},
): Promise<ClientListResult> {
  const session = await requireSession();

  const {
    query = "",
    status = "all",
    riskLevel = "all",
    subscription = "all",
    sortBy = "name",
    sortDir = "asc",
    page = 1,
    pageSize = 10,
    ownBookOnly = false,
  } = params;

  const result = await findClientsApi(session.accessToken, {
    query,
    status,
    riskLevel,
    subscription,
    advisorId: ownBookOnly ? session.userId : scopedAdvisorId(session),
    sortBy,
    sortDir,
    page,
    pageSize,
  });

  if (!result.ok) {
    throw new Error(result.message || "Unable to load clients.");
  }

  const items = filterAssignedClients(
    session,
    result.data.items,
    ownBookOnly,
  );

  return {
    ...result.data,
    items,
    total:
      items.length === result.data.items.length
        ? result.data.total
        : items.length,
  };
}

/**
 * Fetch the full client detail once per request. React's cache() dedupes
 * the call so generateMetadata and the page share a single API round trip.
 */
const fetchClientDetail = cache(async (id: string) => {
  const session = await requireSession();
  const result = await clientDetailApi(session.accessToken, id);

  if (!result.ok) {
    if (result.status === 404) {
      return null;
    }
    throw new Error(result.message || "Unable to load client.");
  }

  if (!assertCanAccessClient(session, result.data.client)) {
    return null;
  }

  return result.data;
});

export async function getClientById(id: string): Promise<Client | null> {
  const detail = await fetchClientDetail(id);
  return detail?.client ?? null;
}

export async function getClientDetail(
  id: string,
): Promise<ClientDetail | null> {
  const detail = await fetchClientDetail(id);
  return detail?.detail ?? null;
}

export async function updateClientSubscription(
  id: string,
  subscription: ClientSubscription,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireAdmin();
  const result = await updateClientSubscriptionApi(session.accessToken, {
    clientId: id,
    subscription,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true };
}

export async function assignClientAdvisor(
  clientId: string,
  advisorId: string | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireAdmin();
  const result = await assignClientAdvisorApi(session.accessToken, {
    clientId,
    advisorId,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const session = await requireSession();
  const apiResult = await getDashboardSummaryApi(session.accessToken);

  if (apiResult.ok) {
    return apiResult.data;
  }

  const result = await findClientsApi(session.accessToken, {
    advisorId: scopedAdvisorId(session),
    page: 1,
    pageSize: 100,
    sortBy: "name",
    sortDir: "asc",
  });

  if (!result.ok) {
    return buildDashboardSummary([]);
  }

  return buildDashboardSummary(
    filterAssignedClients(session, result.data.items),
  );
}

export async function getRecentClients(limit = 5): Promise<Client[]> {
  const session = await requireSession();
  const result = await findClientsApi(session.accessToken, {
    advisorId: scopedAdvisorId(session),
    sortBy: "lastContactAt",
    sortDir: "desc",
    page: 1,
    pageSize: limit,
  });

  if (!result.ok) {
    return [];
  }

  return filterAssignedClients(session, result.data.items);
}
