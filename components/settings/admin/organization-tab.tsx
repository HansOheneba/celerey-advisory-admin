"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveOrganizationSettingsAction } from "@/app/actions/organization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { OrganizationSettings } from "@/lib/settings/organization-store";

type OrganizationTabProps = {
  initialSettings: OrganizationSettings;
};

export function OrganizationTab({ initialSettings }: OrganizationTabProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof OrganizationSettings>(
    key: K,
    value: OrganizationSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveOrganizationSettingsAction({
        name: settings.name,
        website: settings.website,
        supportEmail: settings.supportEmail,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Organization settings saved");
    });
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <p className={dashboardTheme.sectionLabel}>Organization</p>
        <CardTitle className="text-base font-semibold">Firm details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="orgName">Organization name</Label>
          <Input
            id="orgName"
            value={settings.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orgWebsite">Website</Label>
          <Input
            id="orgWebsite"
            type="url"
            value={settings.website}
            onChange={(event) => update("website", event.target.value)}
            placeholder="https://celerey.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orgSupportEmail">Support email</Label>
          <Input
            id="orgSupportEmail"
            type="email"
            value={settings.supportEmail}
            onChange={(event) => update("supportEmail", event.target.value)}
            placeholder="support@celerey.com"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" disabled={pending} onClick={handleSave}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
