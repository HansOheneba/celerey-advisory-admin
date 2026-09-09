import "server-only";

import { cookies } from "next/headers";
import {
  contextFromRole,
  sessionRoleFields,
  type ActingRole,
  type AppRole,
  type RoleScope,
  type StaffRole,
} from "@/lib/auth/roles";
import type { DemoRole } from "@/lib/auth/capabilities";
import { decrypt, encrypt, SESSION_COOKIE } from "@/lib/session-crypto";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(user: {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  role: AppRole;
  trueRoles?: StaffRole[];
  activeRole?: ActingRole | null;
  isSuperAdmin?: boolean;
  availableRoles?: StaffRole[];
  scope?: RoleScope;
  demoRole?: DemoRole;
}) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const base = contextFromRole(user.role);
  const roleFields = sessionRoleFields({
    ...base,
    trueRoles:
      user.trueRoles && user.trueRoles.length > 0 ? user.trueRoles : base.trueRoles,
    activeRole: user.activeRole !== undefined ? user.activeRole : base.activeRole,
    isSuperAdmin: user.isSuperAdmin ?? base.isSuperAdmin,
    availableRoles:
      user.availableRoles && user.availableRoles.length > 0
        ? user.availableRoles
        : base.availableRoles,
    scope: user.scope ?? base.scope,
  });
  const session = await encrypt({
    userId: user.userId,
    name: user.name,
    email: user.email,
    accessToken: user.accessToken,
    ...roleFields,
    ...(user.demoRole ? { demoRole: user.demoRole } : {}),
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export { decrypt, SESSION_COOKIE };
