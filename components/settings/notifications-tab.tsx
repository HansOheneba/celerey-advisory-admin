"use client";

import type { UpdateAdvisorSettings } from "@/components/settings/settings-workspace";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type {
  AdvisorNotificationPreferences,
  AdvisorSettings,
} from "@/lib/settings/local-store";

type NotificationsTabProps = {
  settings: AdvisorSettings;
  onUpdate: UpdateAdvisorSettings;
  onSave: () => void;
  pending?: boolean;
};

const NOTIFICATION_ROWS: Array<{
  key: keyof AdvisorNotificationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "clientAssigned",
    label: "New client assigned",
    description: "Get notified when a client is assigned to your book.",
  },
  {
    key: "clientMessage",
    label: "New client message",
    description: "Highlight unread client replies in Messages.",
  },
  {
    key: "appointmentReminder",
    label: "Appointment reminder",
    description: "Reminders ahead of scheduled client appointments.",
  },
  {
    key: "taskReminder",
    label: "Task reminder",
    description: "Reminders for tasks approaching their due date.",
  },
  {
    key: "documentUploaded",
    label: "Client document uploaded",
    description: "Get notified when a client uploads a new document.",
  },
  {
    key: "goalUpdate",
    label: "Goal update",
    description: "Get notified when a client's goal status changes.",
  },
];

function NotificationRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 px-3 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
    </div>
  );
}

export function NotificationsTab({
  settings,
  onUpdate,
  onSave,
  pending = false,
}: NotificationsTabProps) {
  function updateNotification(
    key: keyof AdvisorNotificationPreferences,
    value: boolean,
  ) {
    onUpdate("notifications", { ...settings.notifications, [key]: value });
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <p className={dashboardTheme.sectionLabel}>Notifications</p>
        <CardTitle className="text-base font-semibold">
          What you're notified about
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {NOTIFICATION_ROWS.map((row) => (
          <NotificationRow
            key={row.key}
            label={row.label}
            description={row.description}
            checked={settings.notifications[row.key]}
            onCheckedChange={(value) => updateNotification(row.key, value)}
          />
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" disabled={pending} onClick={onSave}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
