import type { Metadata } from "next";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { findAuditLogsApi } from "@/lib/api/audit";
import {
  getAvailabilitySettingsApi,
  getNotificationSettingsApi,
  getProfileSettingsApi,
  mergeAdvisorSettings,
} from "@/lib/api/settings";
import { isAdmin } from "@/lib/auth/roles";
import { requireSession } from "@/lib/dal";
import { listAdvisors } from "@/lib/repositories/advisors";
import type { AuditLogEntry } from "@/lib/settings/audit";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const advisor = await requireSession();
  const admin = isAdmin(advisor.role);

  const [profile, notifications, availability, advisors] = await Promise.all([
    getProfileSettingsApi(advisor.accessToken),
    getNotificationSettingsApi(advisor.accessToken),
    getAvailabilitySettingsApi(advisor.accessToken),
    admin
      ? listAdvisors({ page: 1, pageSize: 50 })
      : Promise.resolve({ items: [] }),
  ]);

  const initialSettings = mergeAdvisorSettings(
    advisor.name,
    profile.ok ? profile.data : null,
    notifications.ok ? notifications.data : null,
    availability.ok ? availability.data : null,
  );

  let initialAuditLogs: AuditLogEntry[] = [];

  if (admin) {
    const auditLogs = await findAuditLogsApi(advisor.accessToken, {
      page: 1,
      pageSize: 50,
    });
    initialAuditLogs = auditLogs.ok ? auditLogs.data.items : [];
  }

  return (
    <SettingsWorkspace
      advisor={advisor}
      advisors={advisors.items}
      initialSettings={initialSettings}
      initialAuditLogs={initialAuditLogs}
    />
  );
}
