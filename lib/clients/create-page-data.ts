import { redirect } from "next/navigation";

import { mergeAssignableAdvisors } from "@/lib/advisors/assignable";
import { hasCapability } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import { listAdvisors } from "@/lib/repositories/advisors";

export async function requireClientCreateAccess() {
  const session = await requireSession();

  if (!hasCapability(session.capabilities, "create_client")) {
    redirect("/clients");
  }

  const canAssign = hasCapability(session.capabilities, "assign_advisor");
  const advisorsResult = canAssign
    ? await listAdvisors({ page: 1, pageSize: 100 }).catch(() => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 100,
        pageCount: 1,
      }))
    : {
        items: [],
        total: 0,
        page: 1,
        pageSize: 100,
        pageCount: 1,
      };

  return {
    session,
    canManageSubscriptions: canAssign,
    advisors: mergeAssignableAdvisors(advisorsResult.items, session),
  };
}
