"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import {
  saveOrganizationSettingsAction,
  uploadOrganizationLogoAction,
} from "@/app/actions/organization";
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

type BrandingTabProps = {
  initialSettings: OrganizationSettings;
};

export function BrandingTab({ initialSettings }: BrandingTabProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof OrganizationSettings>(
    key: K,
    value: OrganizationSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadOrganizationLogoAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      update("logoDataUrl", result.logoUrl);
      toast.success("Logo uploaded");
    });

    event.target.value = "";
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
      toast.success("Branding saved");
    });
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <p className={dashboardTheme.sectionLabel}>Branding</p>
        <CardTitle className="text-base font-semibold">
          Logo &amp; display name
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted">
            {settings.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoDataUrl}
                alt="Organization logo"
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload logo
            </Button>
            {settings.logoDataUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => update("logoDataUrl", null)}
              >
                Remove
              </Button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandName">Display name</Label>
          <Input
            id="brandName"
            value={settings.name}
            onChange={(event) => update("name", event.target.value)}
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
