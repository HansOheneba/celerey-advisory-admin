import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  contextFromRole,
  isAdmin,
  sessionRoleFields,
  type ActingRole,
  type AppRole,
  type RoleScope,
  type StaffRole,
} from "@/lib/auth/roles";
import { decrypt, getSessionToken } from "@/lib/session";
import type { Client } from "@/types/client";

export type AdvisorSession = {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  role: AppRole;
  trueRoles: StaffRole[];
  activeRole: ActingRole | null;
  isSuperAdmin: boolean;
  availableRoles: StaffRole[];
  scope: RoleScope;
};

export const verifySession = cache(async (): Promise<AdvisorSession | null> => {
  const token = await getSessionToken();
  const payload = await decrypt(token);

  if (!payload?.userId || !payload.accessToken) {
    return null;
  }

  const roleFields = sessionRoleFields({
    ...contextFromRole(payload.role),
    trueRoles: payload.trueRoles ?? [],
    activeRole: payload.activeRole ?? null,
    isSuperAdmin: payload.isSuperAdmin ?? payload.role === "super_admin",
    availableRoles: payload.availableRoles ?? [],
    scope: payload.scope,
  });

  return {
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    accessToken: payload.accessToken,
    ...roleFields,
  };
});

export async function requireSession() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireSession();

  if (!isAdmin(session.role)) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();

  if (!session.isSuperAdmin) {
    redirect("/dashboard");
  }

  return session;
}

export function canAccessClient(session: AdvisorSession, client: Client) {
  if (isAdmin(session.role)) {
    return true;
  }

  return Boolean(client.advisorId) && client.advisorId === session.userId;
}

export function assertCanAccessClient(
  session: AdvisorSession,
  client: Client | null,
): client is Client {
  if (!client) {
    return false;
  }

  return canAccessClient(session, client);
}
