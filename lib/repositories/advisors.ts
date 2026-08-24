import "server-only";

import { cache } from "react";
import {
  createAdvisorApi,
  findAdvisorsApi,
  getAdvisorDetailApi,
  updateStaffRolesApi,
  type CreateAdvisorInput,
  type FindAdvisorsParams,
} from "@/lib/api/advisors";
import { findClientsApi } from "@/lib/api/clients";
import { normalizeRole, parseIdentityRoles, rolesFromPrimary, type IdentityRole } from "@/lib/auth/roles";
import {
  requireAdmin,
  requireSession,
  requireSuperAdmin,
  type AdvisorSession,
} from "@/lib/dal";
import type { Advisor, AdvisorListResult } from "@/types/advisor";

function rolesForSession(session: AdvisorSession): IdentityRole[] {
  const fromTrueRoles = parseIdentityRoles(session.trueRoles);
  return fromTrueRoles.length > 0
    ? fromTrueRoles
    : rolesFromPrimary(session.role);
}

async function deriveAdvisorsFromClients(
  session: AdvisorSession,
): Promise<Advisor[]> {
  const result = await findClientsApi(session.accessToken, {
    page: 1,
    pageSize: 100,
    sortBy: "name",
    sortDir: "asc",
  });

  if (!result.ok) {
    return [];
  }

  const byId = new Map<string, Advisor>();

  for (const client of result.data.items) {
    if (!client.advisorId) {
      continue;
    }

    const existing = byId.get(client.advisorId);
    if (existing) {
      existing.clientCount += 1;
      continue;
    }

    byId.set(client.advisorId, {
      id: client.advisorId,
      name: client.advisorName || "Advisor",
      email: "",
      role: "advisor",
      roles: ["advisor"],
      clientCount: 1,
    });
  }

  if (!byId.has(session.userId)) {
    byId.set(session.userId, {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      roles: rolesForSession(session),
      clientCount: 0,
    });
  } else {
    const self = byId.get(session.userId);
    if (self) {
      self.name = session.name || self.name;
      self.email = session.email || self.email;
      self.role = session.role;
      self.roles = rolesForSession(session);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function listAdvisors(
  params: FindAdvisorsParams = {},
): Promise<AdvisorListResult> {
  const session = await requireSession();
  const query = params.query?.trim().toLowerCase() ?? "";
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;

  const apiResult = await findAdvisorsApi(session.accessToken, {
    query: params.query,
    page: 1,
    pageSize: 100,
  });

  let items: Advisor[] = [];

  if (apiResult.ok && apiResult.data.items.length > 0) {
    items = apiResult.data.items;
  } else {
    items = await deriveAdvisorsFromClients(session);
  }

  if (!items.some((advisor) => advisor.id === session.userId)) {
    items = [
      {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        roles: rolesForSession(session),
        clientCount: 0,
      },
      ...items,
    ];
  }

  const filtered = query
    ? items.filter(
        (advisor) =>
          advisor.name.toLowerCase().includes(query) ||
          advisor.email.toLowerCase().includes(query),
      )
    : items;

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount,
  };
}

export async function createAdvisor(input: CreateAdvisorInput) {
  const session = await requireAdmin();
  return createAdvisorApi(session.accessToken, input);
}

export async function updateStaffRoles(
  staffId: string,
  roles: IdentityRole[],
) {
  const session = await requireSuperAdmin();
  const requested = parseIdentityRoles(roles);

  if (requested.length === 0) {
    return {
      ok: false as const,
      status: 400,
      message: "Choose at least one role.",
    };
  }

  if (staffId !== session.userId) {
    return updateStaffRolesApi(session.accessToken, {
      staffId,
      roles: requested,
    });
  }

  const existing = parseIdentityRoles(
    session.isSuperAdmin
      ? ["super_admin", ...session.trueRoles]
      : session.trueRoles,
  );

  if (requested.includes("super_admin") && !existing.includes("super_admin")) {
    return {
      ok: false as const,
      status: 400,
      message: "You can't grant yourself super admin.",
    };
  }

  const nextRoles = parseIdentityRoles([...existing, ...requested]);

  return updateStaffRolesApi(session.accessToken, {
    staffId,
    roles: nextRoles,
  });
}

export const getAdvisorById = cache(
  async (id: string): Promise<Advisor | null> => {
    const session = await requireSession();
    const result = await getAdvisorDetailApi(session.accessToken, id);

    if (!result.ok) {
      return null;
    }

    return {
      ...result.data,
      role: normalizeRole(result.data.role),
      roles:
        result.data.roles.length > 0
          ? result.data.roles
          : rolesFromPrimary(normalizeRole(result.data.role)),
    };
  },
);

export async function listClientsForAdvisor(
  advisorId: string,
  params: {
    query?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const session = await requireSession();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const result = await findClientsApi(session.accessToken, {
    query: params.query,
    advisorId,
    page: 1,
    pageSize: 100,
    sortBy: "name",
    sortDir: "asc",
  });

  if (!result.ok) {
    throw new Error(result.message || "Unable to load advisor clients.");
  }

  const items = result.data.items.filter(
    (client) => client.advisorId === advisorId,
  );
  const query = params.query?.trim().toLowerCase() ?? "";
  const filtered = query
    ? items.filter((client) => {
        const name = `${client.firstName} ${client.lastName}`.toLowerCase();
        return (
          name.includes(query) || client.email.toLowerCase().includes(query)
        );
      })
    : items;

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount,
  };
}
