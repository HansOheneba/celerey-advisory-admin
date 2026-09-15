"use client";

import { useState, useTransition } from "react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { toast } from "sonner";
import {
  saveAdvisorSettingsAction,
  uploadAvatarAction,
} from "@/app/actions/settings";
import type { AuditLogEntry } from "@/lib/settings/audit";
import { AuditLogsTab } from "@/components/settings/admin/audit-logs-tab";
import { UsersRolesTab } from "@/components/settings/admin/users-roles-tab";
import { AvailabilityTab } from "@/components/settings/availability-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { ProfileTab } from "@/components/settings/profile-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAdmin } from "@/lib/auth/roles";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { AdvisorSession } from "@/lib/dal";
import type { AdvisorSettings } from "@/lib/settings/local-store";
import type { Advisor } from "@/types/advisor";

export type UpdateAdvisorSettings = <K extends keyof AdvisorSettings>(
  key: K,
  value: AdvisorSettings[K],
) => void;

type SettingsWorkspaceProps = {
  advisor: AdvisorSession;
  advisors?: Advisor[];
  initialSettings: AdvisorSettings;
  initialAuditLogs: AuditLogEntry[];
};

export function SettingsWorkspace({
  advisor,
  advisors = [],
  initialSettings,
  initialAuditLogs,
}: SettingsWorkspaceProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [pending, startTransition] = useTransition();
  const admin = isAdmin(advisor.role);

  const update: UpdateAdvisorSettings = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  function handleSave() {
    startTransition(async () => {
      const result = await saveAdvisorSettingsAction(settings);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Settings saved");
    });
  }

  function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadAvatarAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      update("avatarDataUrl", result.avatarUrl);
      toast.success("Photo updated");
    });
  }

  return (
    <div className={dashboardTheme.page}>
      <section className="space-y-0.5">
        <SectionEyebrow>Workspace</SectionEyebrow>
        <h2 className={dashboardTheme.pageTitle}>Settings</h2>
        <p className={dashboardTheme.pageDescription}>
          {admin
            ? "Personal preferences plus team roles and activity for this portal."
            : "Profile, notifications, and availability for your advisory practice."}
        </p>
      </section>

      <Tabs defaultValue="profile">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          {admin ? (
            <>
              <TabsTrigger value="users-roles">Users &amp; Roles</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            </>
          ) : null}
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            advisor={advisor}
            settings={settings}
            onUpdate={update}
            onSave={handleSave}
            onAvatarUpload={handleAvatarUpload}
            pending={pending}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab
            settings={settings}
            onUpdate={update}
            onSave={handleSave}
            pending={pending}
          />
        </TabsContent>
        <TabsContent value="availability">
          <AvailabilityTab
            settings={settings}
            onUpdate={update}
            onSave={handleSave}
            pending={pending}
          />
        </TabsContent>

        {admin ? (
          <>
            <TabsContent value="users-roles">
              <UsersRolesTab
                advisors={advisors}
                canManageRoles={advisor.isSuperAdmin}
                currentUserId={advisor.userId}
              />
            </TabsContent>
            <TabsContent value="audit-logs">
              <AuditLogsTab initialLogs={initialAuditLogs} />
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </div>
  );
}
