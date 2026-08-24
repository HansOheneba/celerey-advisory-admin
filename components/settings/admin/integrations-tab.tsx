"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveOrganizationIntegrationsAction } from "@/app/actions/organization";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { OrganizationIntegrations } from "@/lib/settings/organization-store";

const INTEGRATION_ROWS: Array<{
  key: keyof OrganizationIntegrations;
  label: string;
  description: string;
}> = [
  {
    key: "calendarSync",
    label: "Calendar sync",
    description: "Sync advisor appointments with Google or Outlook calendars.",
  },
  {
    key: "emailDelivery",
    label: "Email delivery",
    description:
      "Send client notifications and reports through a connected email provider.",
  },
  {
    key: "slackAlerts",
    label: "Slack alerts",
    description: "Post assignment and message alerts to a Slack channel.",
  },
];

type IntegrationsTabProps = {
  initialIntegrations: OrganizationIntegrations;
};

export function IntegrationsTab({
  initialIntegrations,
}: IntegrationsTabProps) {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof OrganizationIntegrations, value: boolean) {
    const previous = integrations;
    const next = { ...integrations, [key]: value };
    setIntegrations(next);

    startTransition(async () => {
      const result = await saveOrganizationIntegrationsAction(next);
      if (!result.ok) {
        setIntegrations(previous);
        toast.error(result.message);
        return;
      }
      toast.success(value ? "Integration enabled" : "Integration disabled");
    });
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <p className={dashboardTheme.sectionLabel}>Integrations</p>
        <CardTitle className="text-base font-semibold">
          Connected services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          These flags record intent only — enabling calendar sync does not
          complete an OAuth handshake yet.
        </p>
        {INTEGRATION_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-4 rounded-lg border border-border/50 px-3 py-3"
          >
            <span>
              <span className="block text-sm font-medium">{row.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {row.description}
              </span>
            </span>
            <Switch
              checked={integrations[row.key]}
              disabled={pending}
              onCheckedChange={(value) => toggle(row.key, value)}
              className="mt-0.5"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
