import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { ClientAvailability } from "@/lib/availability/types";
import {
  ADVISOR_TIMEZONES,
  WEEKDAYS,
} from "@/lib/settings/options";
import { cn } from "@/lib/utils";

type ClientAvailabilityCardProps = {
  availability: ClientAvailability;
};

function formatAvailabilityTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function timezoneLabel(value: string): string {
  return (
    ADVISOR_TIMEZONES.find((zone) => zone.value === value)?.label ?? value
  );
}

export function ClientAvailabilityCard({
  availability,
}: ClientAvailabilityCardProps) {
  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <p className={dashboardTheme.sectionLabel}>Scheduling</p>
        <CardTitle className="text-base font-semibold">
          Client availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set by the client. Booking uses the overlap with your hours in
          Settings.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className={dashboardTheme.statLabel}>Available from</p>
            <p className="text-sm font-medium tabular-nums">
              {formatAvailabilityTime(availability.hoursStart)}
            </p>
          </div>
          <div className="space-y-1">
            <p className={dashboardTheme.statLabel}>Available until</p>
            <p className="text-sm font-medium tabular-nums">
              {formatAvailabilityTime(availability.hoursEnd)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className={dashboardTheme.statLabel}>Days</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const isAvailable = availability.daysAvailable.includes(day.value);

              return (
                <Badge
                  key={day.value}
                  variant={isAvailable ? "default" : "outline"}
                  className={cn(
                    "min-w-11 justify-center px-3 py-1 text-xs font-medium",
                    !isAvailable && "text-muted-foreground",
                  )}
                >
                  {day.label}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <p className={dashboardTheme.statLabel}>Time zone</p>
          <p className="text-sm font-medium">
            {timezoneLabel(availability.timezone)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
