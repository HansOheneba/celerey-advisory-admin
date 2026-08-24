import "server-only";

import { executeApi, executeMultipartApi } from "@/lib/api/execute";
import type { AuditLogEntry } from "@/lib/settings/audit";
import {
  defaultOrganizationSettings,
  type OrganizationIntegrations,
  type OrganizationSettings,
} from "@/lib/settings/organization-store";

export type { AuditLogEntry };

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeOrganizationSettings(
  org?: Record<string, unknown> | null,
  integrations?: Record<string, unknown> | null,
): OrganizationSettings {
  const fallback = defaultOrganizationSettings();
  const logoUrl = asString(org?.logoUrl ?? org?.logo_url ?? org?.logoDataUrl);

  return {
    name: asString(org?.name, fallback.name) || fallback.name,
    website: asString(org?.website, fallback.website),
    supportEmail: asString(
      org?.supportEmail ?? org?.support_email,
      fallback.supportEmail,
    ),
    logoDataUrl: logoUrl || null,
    integrations: {
      calendarSync: asBoolean(
        integrations?.calendarSync ?? integrations?.calendar_sync,
        fallback.integrations.calendarSync,
      ),
      emailDelivery: asBoolean(
        integrations?.emailDelivery ?? integrations?.email_delivery,
        fallback.integrations.emailDelivery,
      ),
      slackAlerts: asBoolean(
        integrations?.slackAlerts ?? integrations?.slack_alerts,
        fallback.integrations.slackAlerts,
      ),
    },
  };
}

export async function getOrganizationApi(accessToken: string) {
  return executeApi<Record<string, unknown>>("admin.organization.get", {
    method: "GET",
    accessToken,
  });
}

export async function updateOrganizationApi(
  accessToken: string,
  body: { name: string; website: string; supportEmail: string },
) {
  return executeApi<Record<string, unknown>>("admin.organization.update", {
    method: "PUT",
    accessToken,
    body,
  });
}

export async function uploadOrganizationLogoApi(
  accessToken: string,
  file: Blob,
) {
  const formData = new FormData();
  formData.append("file", file, file instanceof File ? file.name : "logo");

  return executeMultipartApi<{ logoUrl?: string; logo_url?: string }>(
    "admin.organization.branding.logo.upload",
    {
      formData,
      accessToken,
    },
  );
}

export async function getOrganizationIntegrationsApi(accessToken: string) {
  return executeApi<Record<string, unknown>>(
    "admin.organization.integrations.get",
    {
      method: "GET",
      accessToken,
    },
  );
}

export async function updateOrganizationIntegrationsApi(
  accessToken: string,
  body: OrganizationIntegrations,
) {
  return executeApi<Record<string, unknown>>(
    "admin.organization.integrations.update",
    {
      method: "PUT",
      accessToken,
      body,
    },
  );
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
        typeof result.data.pageCount === "number"
          ? result.data.pageCount
          : 1,
    },
  };
}
