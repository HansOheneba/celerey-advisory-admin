import "server-only";

import {
  buildDashboardSummary,
  clients,
  createClientRecord,
} from "@/lib/data/clients";
import type { Client, DashboardSummary } from "@/types/client";

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ClientListParams = {
  query?: string;
  status?: string;
  riskLevel?: string;
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
  await delay();

  const {
    query = "",
    status = "all",
    riskLevel = "all",
    sortBy = "name",
    sortDir = "asc",
    page = 1,
    pageSize = 8,
  } = params;

  const normalizedQuery = query.trim().toLowerCase();

  let filtered = clients.filter((client) => {
    const matchesQuery =
      !normalizedQuery ||
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(normalizedQuery) ||
      client.email.toLowerCase().includes(normalizedQuery) ||
      client.location.toLowerCase().includes(normalizedQuery);

    const matchesStatus = status === "all" || client.status === status;
    const matchesRisk = riskLevel === "all" || client.riskLevel === riskLevel;

    return matchesQuery && matchesStatus && matchesRisk;
  });

  filtered = [...filtered].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "aua":
        comparison = a.aua - b.aua;
        break;
      case "lastContactAt":
        comparison =
          new Date(a.lastContactAt).getTime() -
          new Date(b.lastContactAt).getTime();
        break;
      case "nextReviewAt":
        comparison =
          new Date(a.nextReviewAt).getTime() -
          new Date(b.nextReviewAt).getTime();
        break;
      case "name":
      default:
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
        break;
    }

    return sortDir === "asc" ? comparison : -comparison;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount,
  };
}

export async function getClientById(id: string): Promise<Client | null> {
  await delay();
  return clients.find((client) => client.id === id) ?? null;
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

  return { client };
}
