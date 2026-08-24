import "server-only";

import {
  normalizeRole,
  primaryStaffRole,
  resolveIdentityRoles,
  type AppRole,
  type IdentityRole,
  type InviteRole,
} from "@/lib/auth/roles";
import { executeApi } from "@/lib/api/execute";
import type { Advisor, AdvisorListResult } from "@/types/advisor";

type ApiAdvisorRow = {
  id?: string;
  advisor_id?: string;
  staff_id?: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: unknown;
  trueRoles?: unknown;
  true_roles?: unknown;
  isClient?: boolean;
  is_client?: boolean;
  clientCount?: number;
  client_count?: number;
  createdAt?: string;
  created_at?: string;
};

export type CreateAdvisorInput = {
  name: string;
  email: string;
  role?: InviteRole;
};

export type FindAdvisorsParams = {
  query?: string;
  page?: number;
  pageSize?: number;
};

function normalizeAdvisor(row: ApiAdvisorRow): Advisor {
  const roles = resolveIdentityRoles(row);

  return {
    id: String(row.id ?? row.advisor_id ?? row.staff_id ?? ""),
    name: row.name?.trim() || "Advisor",
    email: row.email?.trim().toLowerCase() || "",
    role: primaryStaffRole(roles),
    roles,
    clientCount:
      typeof row.clientCount === "number"
        ? row.clientCount
        : typeof row.client_count === "number"
          ? row.client_count
          : 0,
    createdAt: row.createdAt ?? row.created_at,
  };
}

export async function findAdvisorsApi(
  accessToken: string,
  params: FindAdvisorsParams = {},
) {
  const result = await executeApi<{
    items?: ApiAdvisorRow[];
    total?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
  }>("admin.advisors.find", {
    method: "GET",
    accessToken,
    searchParams: {
      query: params.query,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });

  if (!result.ok) {
    return result;
  }

  const raw = result.data;
  const items = Array.isArray(raw.items) ? raw.items : [];
  console.log("[advisors]", JSON.stringify(items, null, 2));
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
      items: items.map(normalizeAdvisor).filter((advisor) => advisor.id),
      total,
      page,
      pageSize,
      pageCount,
    } satisfies AdvisorListResult,
  };
}

function splitAdvisorName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? name.trim();
  const lastName = parts.slice(1).join(" ") || firstName;

  return { firstName, lastName, name: name.trim() };
}

export async function createAdvisorApi(
  accessToken: string,
  input: CreateAdvisorInput,
) {
  const { firstName, lastName, name } = splitAdvisorName(input.name);

  const result = await executeApi<ApiAdvisorRow & {
    advisor?: ApiAdvisorRow;
    invite?: { token?: string; onboardingUrl?: string };
  }>("admin.advisors.create", {
    method: "POST",
    accessToken,
    body: {
      firstName,
      lastName,
      name,
      email: input.email,
      role: input.role ?? "advisor",
      sendInvite: true,
    },
  });

  if (!result.ok) {
    return result;
  }

  const row = result.data.advisor ?? result.data;

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAdvisor(row),
  };
}

export async function getAdvisorDetailApi(
  accessToken: string,
  advisorId: string,
) {
  const result = await executeApi<ApiAdvisorRow>("admin.advisors.detail", {
    method: "GET",
    accessToken,
    searchParams: { advisor_id: advisorId },
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAdvisor(result.data),
  };
}

export async function updateStaffRolesApi(
  accessToken: string,
  input: { staffId: string; roles: IdentityRole[] },
) {
  return executeApi<ApiAdvisorRow>("admin.roles.update", {
    method: "PUT",
    accessToken,
    body: {
      staff_id: input.staffId,
      roles: input.roles,
    },
  });
}

export type AdvisorOnboardingInvite = {
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  alreadyCompleted: boolean;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function getAdvisorOnboardingInviteApi(token: string) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.advisors.onboarding.get",
    {
      method: "GET",
      searchParams: { token },
      redirectOnUnauthorized: false,
    },
  );

  if (!result.ok) {
    return result;
  }

  const firstName = asString(result.data.firstName ?? result.data.first_name);
  const lastName = asString(result.data.lastName ?? result.data.last_name);

  return {
    ok: true as const,
    status: result.status,
    data: {
      email: asString(result.data.email).toLowerCase(),
      firstName,
      lastName,
      role: normalizeRole(asString(result.data.role)),
      alreadyCompleted: result.data.alreadyCompleted === true,
    } satisfies AdvisorOnboardingInvite,
  };
}

export async function completeAdvisorOnboardingApi(input: {
  token: string;
  displayName: string;
  title: string;
  phone: string;
  bio: string;
  country: string;
  timezone: string;
}) {
  return executeApi<{
    session_token?: string;
    advisor?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  }>("admin.advisors.onboarding.complete", {
    method: "POST",
    body: input,
    redirectOnUnauthorized: false,
  });
}
