import "server-only";

import { bookScope, type DemoRole } from "@/lib/auth/capabilities";
import { DEMO_USERS } from "@/lib/demo/seed/users";
import type { DemoClientRecord, DemoDatabase } from "@/lib/demo/types";

export type BookScopeContext = {
  userId: string;
  demoRole: DemoRole;
};

function isUnassigned(advisorId: string | null | undefined): boolean {
  return !advisorId || advisorId === "unassigned";
}

/**
 * Clients visible to the acting user per the privilege matrix:
 * RMs see their own book, team leads their team's plus unassigned, firm roles see all.
 */
export function scopedClientRecords(
  db: DemoDatabase,
  context: BookScopeContext,
): DemoClientRecord[] {
  const scope = bookScope(context.demoRole);

  if (scope === "firm") {
    return db.clients;
  }

  if (scope === "team") {
    const teamMemberIds = new Set(
      DEMO_USERS.filter(
        (member) =>
          member.teamLeadId === context.userId || member.id === context.userId,
      ).map((member) => member.id),
    );

    return db.clients.filter(
      (record) =>
        isUnassigned(record.client.advisorId) ||
        teamMemberIds.has(record.client.advisorId),
    );
  }

  return db.clients.filter(
    (record) => record.client.advisorId === context.userId,
  );
}

export function canAccessClientRecord(
  db: DemoDatabase,
  context: BookScopeContext,
  clientId: string,
): boolean {
  return scopedClientRecords(db, context).some(
    (record) => record.client.id === clientId,
  );
}
