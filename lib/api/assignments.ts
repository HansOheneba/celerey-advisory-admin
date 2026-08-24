import "server-only";

import { executeApi } from "@/lib/api/execute";

export async function bulkAssignClientsApi(
  accessToken: string,
  input: {
    clientIds: string[];
    advisorId: string;
    reason?: string;
  },
) {
  return executeApi<{
    assignedCount?: number;
    assigned_count?: number;
    failedClientIds?: string[];
    failed_client_ids?: string[];
  }>("admin.assignments.bulk-assign", {
    method: "POST",
    accessToken,
    body: {
      clientIds: input.clientIds,
      advisorId: input.advisorId,
      ...(input.reason ? { reason: input.reason } : {}),
    },
  });
}
