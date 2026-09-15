"use client";

import type { UpdateAdvisorSettings } from "@/components/settings/settings-workspace";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { AdvisorSettings } from "@/lib/settings/local-store";
import {
  ADVISOR_COUNTRIES,
  ADVISOR_TIMEZONES,
  APPOINTMENT_BUFFERS,
  APPOINTMENT_DURATIONS,
  WEEKDAYS,
  type Weekday,
} from "@/lib/settings/options";

type AvailabilityTabProps = {
  settings: AdvisorSettings;
  onUpdate: UpdateAdvisorSettings;
  onSave: () => void;
  pending?: boolean;
};

export function AvailabilityTab({
  settings,
  onUpdate,
  onSave,
  pending = false,
}: AvailabilityTabProps) {
  function toggleDay(day: Weekday) {
    const isSelected = settings.daysAvailable.includes(day);
    const next = isSelected
      ? settings.daysAvailable.filter((value) => value !== day)
      : [...settings.daysAvailable, day];
    onUpdate("daysAvailable", next);
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <SectionEyebrow>Availability</SectionEyebrow>
        <CardTitle className="text-base font-semibold">
          Working hours &amp; scheduling
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Matched against each client&apos;s availability when they request or
          book a session.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hoursStart">Working hours start</Label>
            <Input
              id="hoursStart"
              type="time"
              value={settings.workingHoursStart}
              onChange={(event) =>
                onUpdate("workingHoursStart", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursEnd">Working hours end</Label>
            <Input
              id="hoursEnd"
              type="time"
              value={settings.workingHoursEnd}
              onChange={(event) =>
                onUpdate("workingHoursEnd", event.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Days available</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = settings.daysAvailable.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    "h-8 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="appointmentDuration">
              Default appointment length
            </Label>
            <Select
              value={String(settings.appointmentDurationMinutes)}
              onValueChange={(value) =>
                onUpdate(
                  "appointmentDurationMinutes",
                  value ? Number(value) : settings.appointmentDurationMinutes,
                )
              }
            >
              <SelectTrigger id="appointmentDuration" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_DURATIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointmentBuffer">Buffer between appointments</Label>
            <Select
              value={String(settings.appointmentBufferMinutes)}
              onValueChange={(value) =>
                onUpdate(
                  "appointmentBufferMinutes",
                  value ? Number(value) : settings.appointmentBufferMinutes,
                )
              }
            >
              <SelectTrigger id="appointmentBuffer" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_BUFFERS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={settings.country}
              onValueChange={(value) =>
                onUpdate("country", value ?? settings.country)
              }
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADVISOR_COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Time zone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) =>
                onUpdate("timezone", value ?? settings.timezone)
              }
            >
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADVISOR_TIMEZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
