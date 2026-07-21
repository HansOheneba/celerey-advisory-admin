import "server-only";

import { cache } from "react";

import {
  clientDetailApi,
  findClientsApi,
  updateClientSubscriptionApi,
} from "@/lib/api/clients";
import { buildDashboardSummary, clients } from "@/lib/data/clients";
import { requireSession } from "@/lib/dal";
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
};

export type ClientListResult = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

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
  } = params;

  const result = await findClientsApi(session.accessToken, {
    query,
    status,
    riskLevel,
    subscription,
    sortBy,
    sortDir,
    page,
    pageSize,
  });

  if (!result.ok) {
    throw new Error(result.message || "Unable to load clients.");
  }

  return result.data;
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
  const session = await requireSession();
  const result = await updateClientSubscriptionApi(session.accessToken, {
    clientId: id,
    subscription,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return buildDashboardSummary(clients);
}

export async function getRecentClients(limit = 5): Promise<Client[]> {
  const session = await requireSession();
  const result = await findClientsApi(session.accessToken, {
    sortBy: "lastContactAt",
    sortDir: "desc",
    page: 1,
    pageSize: limit,
  });

  if (!result.ok) {
    return [];
  }

  return result.data.items;
}
