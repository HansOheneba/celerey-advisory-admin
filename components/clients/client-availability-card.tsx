"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateClientAvailabilityAction } from "@/app/actions/availability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  ADVISOR_TIMEZONES,
  WEEKDAYS,
  type Weekday,
} from "@/lib/settings/options";
import type { ClientAvailability } from "@/lib/availability/types";
import { cn } from "@/lib/utils";

type ClientAvailabilityCardProps = {
  clientId: string;
  initial: ClientAvailability;
  canEdit: boolean;
};

export function ClientAvailabilityCard({
  clientId,
  initial,
  canEdit,
}: ClientAvailabilityCardProps) {
  const [availability, setAvailability] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggleDay(day: Weekday) {
    const selected = availability.daysAvailable.includes(day);
    setAvailability((current) => ({
      ...current,
      daysAvailable: selected
        ? current.daysAvailable.filter((value) => value !== day)
        : [...current.daysAvailable, day],
    }));
  }

  function save() {
    startTransition(async () => {
      const result = await updateClientAvailabilityAction({
        clientId,
        availability,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setAvailability(result.availability);
      toast.success("Availability saved");
    });
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <p className={dashboardTheme.sectionLabel}>Scheduling</p>
        <CardTitle className="text-base font-semibold">
          Client availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Session slots are the overlap of these hours and yours in Settings.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientHoursStart">Available from</Label>
            <Input
              id="clientHoursStart"
              type="time"
              value={availability.hoursStart}
              disabled={!canEdit}
              onChange={(event) =>
                setAvailability((current) => ({
                  ...current,
                  hoursStart: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientHoursEnd">Available until</Label>
            <Input
              id="clientHoursEnd"
              type="time"
              value={availability.hoursEnd}
              disabled={!canEdit}
              onChange={(event) =>
                setAvailability((current) => ({
                  ...current,
                  hoursEnd: event.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Days</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = availability.daysAvailable.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => toggleDay(day.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    "h-8 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-50",
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
        <div className="space-y-2">
          <Label htmlFor="clientTimezone">Time zone</Label>
          <Select
            value={availability.timezone}
            disabled={!canEdit}
            onValueChange={(value) =>
              setAvailability((current) => ({
                ...current,
                timezone: value ?? current.timezone,
              }))
            }
          >
            <SelectTrigger id="clientTimezone" className="w-full">
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
      </CardContent>
      {canEdit ? (
        <CardFooter className="justify-end">
          <Button type="button" disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save availability"}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
