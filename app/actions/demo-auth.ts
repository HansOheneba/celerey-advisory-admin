"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDemoRole, type DemoRole } from "@/lib/auth/capabilities";
import { contextFromRole, sessionRoleFields } from "@/lib/auth/roles";
import { requireSession } from "@/lib/dal";
import { demoAccessToken } from "@/lib/demo/api-router";
import { demoUserByRole } from "@/lib/demo/seed/users";
import { createSession } from "@/lib/session";

const APP_ROLE_BY_DEMO_ROLE: Record<
  DemoRole,
  "advisor" | "admin" | "super_admin"
> = {
  relationship_manager: "advisor",
  portfolio_officer: "advisor",
  team_lead: "admin",
  compliance: "admin",
  management: "super_admin",
};

async function startSessionAs(role: DemoRole) {
  const user = demoUserByRole(role);
  const appRole = APP_ROLE_BY_DEMO_ROLE[role];

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    accessToken: demoAccessToken(user.id),
    ...sessionRoleFields(contextFromRole(appRole)),
    demoRole: role,
  });
}

/** Sign in as one of the seeded staff roles. */
export async function signInAsDemoRole(formData: FormData) {
  const role = String(formData.get("role") ?? "");

  if (!isDemoRole(role)) {
    return;
  }

  await startSessionAs(role);
  redirect("/dashboard");
}

/**
 * Swap the acting role in place. The whole portal re-renders against the new
 * capability set, which is the point of the demo's role switcher.
 */
export async function switchDemoRole(role: DemoRole) {
  await requireSession();

  if (!isDemoRole(role)) {
    return { ok: false as const, message: "Unknown role." };
  }

  await startSessionAs(role);
  revalidatePath("/", "layout");

  return { ok: true as const };
}
