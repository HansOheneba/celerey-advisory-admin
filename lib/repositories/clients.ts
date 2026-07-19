import "server-only";

import { findClientsApi } from "@/lib/api/clients";
import {
  buildDashboardSummary,
  clients,
  createClientRecord,
} from "@/lib/data/clients";
import {
  ensureClientDetail,
  updateDetailSubscription,
} from "@/lib/data/client-details";
import { requireSession } from "@/lib/dal";
import type { Client, ClientSubscription, DashboardSummary } from "@/types/client";
import type { ClientDetail } from "@/types/client-detail";

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export async function getClientById(id: string): Promise<Client | null> {
  await delay();
  return clients.find((client) => client.id === id) ?? null;
}

export async function getClientDetail(id: string): Promise<ClientDetail | null> {
  await delay(160);
  const client = clients.find((row) => row.id === id);
  if (!client) {
    return null;
  }

  return ensureClientDetail(client);
}

export async function updateClientSubscription(
  id: string,
  subscription: ClientSubscription,
): Promise<ClientDetail | null> {
  await delay();
  const client = clients.find((row) => row.id === id);
  if (!client) {
    return null;
  }

  client.subscription = subscription;
  ensureClientDetail(client);
  return updateDetailSubscription(id, subscription);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay(180);
  return buildDashboardSummary(clients);
}

export async function getRecentClients(limit = 5): Promise<Client[]> {
  await delay();
  return [...clients]
    .sort(
      (a, b) =>
        new Date(b.lastContactAt).getTime() -
        new Date(a.lastContactAt).getTime(),
    )
    .slice(0, limit);
}

export async function createClient(input: {
  firstName: string;
  lastName: string;
  email: string;
  advisorId: string;
  advisorName: string;
}): Promise<{ client: Client } | { error: string }> {
  await delay();

  const email = input.email.toLowerCase();
  const exists = clients.some((client) => client.email === email);

  if (exists) {
    return { error: "A client with this email already exists." };
  }

  const client = createClientRecord({
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    advisorId: input.advisorId,
    advisorName: input.advisorName,
  });

  ensureClientDetail(client);

  return { client };
}
