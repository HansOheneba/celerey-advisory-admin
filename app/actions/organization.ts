"use server";

import { revalidatePath } from "next/cache";
import {
  findAuditLogsApi,
  getOrganizationApi,
  getOrganizationIntegrationsApi,
  normalizeOrganizationSettings,
  updateOrganizationApi,
  updateOrganizationIntegrationsApi,
  uploadOrganizationLogoApi,
} from "@/lib/api/organization";
import { requireAdmin } from "@/lib/dal";
import type { AuditLogEntry } from "@/lib/settings/audit";
import type {
  OrganizationIntegrations,
  OrganizationSettings,
} from "@/lib/settings/organization-store";

export async function loadOrganizationSettingsAction(): Promise<OrganizationSettings> {
  const session = await requireAdmin();
  const [org, integrations] = await Promise.all([
    getOrganizationApi(session.accessToken),
    getOrganizationIntegrationsApi(session.accessToken),
  ]);

  return normalizeOrganizationSettings(
    org.ok ? org.data : null,
    integrations.ok ? integrations.data : null,
  );
}

export async function saveOrganizationSettingsAction(input: {
  name: string;
  website: string;
  supportEmail: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireAdmin();
  const result = await updateOrganizationApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/settings");

  return { ok: true };
}

export async function saveOrganizationIntegrationsAction(
  integrations: OrganizationIntegrations,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireAdmin();
  const result = await updateOrganizationIntegrationsApi(
    session.accessToken,
    integrations,
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/settings");

  return { ok: true };
}

export async function uploadOrganizationLogoAction(
  formData: FormData,
): Promise<{ ok: true; logoUrl: string } | { ok: false; message: string }> {
  const session = await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof Blob) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." };
  }

  const result = await uploadOrganizationLogoApi(session.accessToken, file);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const logoUrl = result.data.logoUrl ?? result.data.logo_url ?? "";

  if (!logoUrl) {
    return { ok: false, message: "Upload succeeded but no logo URL returned." };
  }

  revalidatePath("/settings");

  return { ok: true, logoUrl };
}

export async function listAuditLogsAction(): Promise<
  { ok: true; items: AuditLogEntry[] } | { ok: false; message: string }
> {
  const session = await requireAdmin();
  const result = await findAuditLogsApi(session.accessToken, {
    page: 1,
    pageSize: 50,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, items: result.data.items };
}
