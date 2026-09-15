"use client";

import { useRef, type ChangeEvent } from "react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { Camera } from "lucide-react";
import type { UpdateAdvisorSettings } from "@/components/settings/settings-workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { AdvisorSession } from "@/lib/dal";
import { getInitials } from "@/lib/format";
import type { AdvisorSettings } from "@/lib/settings/local-store";

type ProfileTabProps = {
  advisor: AdvisorSession;
  settings: AdvisorSettings;
  onUpdate: UpdateAdvisorSettings;
  onSave: () => void;
  onAvatarUpload: (file: File) => void;
  pending?: boolean;
};

function initialsFromName(name: string) {
  const [first = "", last = ""] = name.trim().split(/\s+/);
  return getInitials(first, last || first);
}

export function ProfileTab({
  advisor,
  settings,
  onUpdate,
  onSave,
  onAvatarUpload,
  pending = false,
}: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onAvatarUpload(file);
    event.target.value = "";
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <SectionEyebrow>Profile</SectionEyebrow>
        <CardTitle className="text-base font-semibold">
          Personal details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {settings.avatarDataUrl ? (
              <AvatarImage
                src={settings.avatarDataUrl}
                alt={settings.displayName}
              />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initialsFromName(settings.displayName || advisor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera />
              Change photo
            </Button>
            {settings.avatarDataUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => onUpdate("avatarDataUrl", null)}
              >
                Remove
              </Button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={settings.displayName}
              onChange={(event) => onUpdate("displayName", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={settings.title}
              onChange={(event) => onUpdate("title", event.target.value)}
              placeholder="Senior Wealth Advisor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={advisor.email} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone}
              onChange={(event) => onUpdate("phone", event.target.value)}
              placeholder="+233 20 000 0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={3}
            value={settings.bio}
            onChange={(event) => onUpdate("bio", event.target.value)}
            placeholder="A short introduction clients see on their advisor's profile."
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" disabled={pending} onClick={onSave}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
