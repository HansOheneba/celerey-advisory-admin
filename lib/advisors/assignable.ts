import { isAdmin, roleLabel, rolesFromPrimary } from "@/lib/auth/roles";
import type { AdvisorSession } from "@/lib/dal";
import { DEMO_USERS } from "@/lib/demo/seed/users";
import { getInitials } from "@/lib/format";
import type { Advisor } from "@/types/advisor";

const RELATIONSHIP_MANAGER_IDS = new Set(
  DEMO_USERS.filter((user) => user.demoRole === "relationship_manager").map(
    (user) => user.id,
  ),
);

/** RMs who can receive client assignments in the demo. */
export function filterRelationshipManagers(advisors: Advisor[]): Advisor[] {
  return advisors.filter((advisor) => RELATIONSHIP_MANAGER_IDS.has(advisor.id));
}

/**
 * Admins are also advisors and can hold a client book.
 * Ensure the current session user is always present in assign pickers.
 */
export function mergeAssignableAdvisors(
  advisors: Advisor[],
  session: Pick<AdvisorSession, "userId" | "name" | "email" | "role">,
): Advisor[] {
  const byId = new Map<string, Advisor>();

  for (const advisor of advisors) {
    if (advisor.id) {
      byId.set(advisor.id, advisor);
    }
  }

  if (!byId.has(session.userId)) {
    byId.set(session.userId, {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      roles: rolesFromPrimary(session.role),
      clientCount: 0,
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function advisorOptionLabel(advisor: Advisor) {
  return isAdmin(advisor.role)
    ? `${advisor.name} (${roleLabel(advisor.role)})`
    : advisor.name;
}

export function advisorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return getInitials(parts[0], parts[parts.length - 1]);
}

export function advisorLabelForId(
  advisors: Advisor[],
  advisorId: string | null | undefined,
  fallback = "Choose advisor",
) {
  if (!advisorId || advisorId === "unassigned") {
    return fallback;
  }

  const advisor = advisors.find((item) => item.id === advisorId);
  return advisor ? advisorOptionLabel(advisor) : fallback;
}

export function advisorWorkloadLabel(count: number) {
  return count === 1 ? "1 client" : `${count} clients`;
}
