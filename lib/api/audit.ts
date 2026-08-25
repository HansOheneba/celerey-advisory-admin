import "server-only";

import { executeApi } from "@/lib/api/execute";
import type { AuditLogEntry } from "@/lib/settings/audit";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function findAuditLogsApi(
  accessToken: string,
  params: {
    actorId?: string;
    targetType?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const result = await executeApi<{
    items?: Array<Record<string, unknown>>;
    total?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
  }>("admin.audit-logs.find", {
    method: "GET",
    accessToken,
    searchParams: {
      actorId: params.actorId,
      targetType: params.targetType,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];

  return {
    ok: true as const,
    status: result.status,
    data: {
      items: items.map(
        (row): AuditLogEntry => ({
          id: asString(row.id),
          actorId: asString(row.actorId ?? row.actor_id),
          actorName: asString(row.actorName ?? row.actor_name),
          action: asString(row.action),
          targetType:
            typeof (row.targetType ?? row.target_type) === "string"
              ? asString(row.targetType ?? row.target_type)
              : null,
          targetId:
            typeof (row.targetId ?? row.target_id) === "string"
              ? asString(row.targetId ?? row.target_id)
              : null,
          targetLabel:
            typeof (row.targetLabel ?? row.target_label) === "string"
              ? asString(row.targetLabel ?? row.target_label)
              : null,
          occurredAt: asString(row.occurredAt ?? row.occurred_at),
        }),
      ),
      total:
        typeof result.data.total === "number"
          ? result.data.total
          : items.length,
      page: typeof result.data.page === "number" ? result.data.page : 1,
      pageSize:
        typeof result.data.pageSize === "number"
          ? result.data.pageSize
          : (params.pageSize ?? 20),
      pageCount:
        typeof result.data.pageCount === "number" ? result.data.pageCount : 1,
    },
  };
}
