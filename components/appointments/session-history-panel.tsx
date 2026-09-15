"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { MeetingDetailSheet } from "@/components/appointments/meeting-detail-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Appointment } from "@/lib/appointments/types";
import {
  formatShortDate,
  formatTimeLabel,
  getAppointmentTitle,
  getSessionPreview,
  groupPastSessionsByMonth,
  partitionPastSessions,
} from "@/lib/appointments/display";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

type SessionHistoryPanelProps = {
  appointments: Appointment[];
  showClientName?: boolean;
  emptyMessage?: string;
  className?: string;
};

export function SessionHistoryPanel({
  appointments,
  showClientName = true,
  emptyMessage = "No completed sessions yet. Log a meeting from the schedule or publish AI notes after review.",
  className,
}: SessionHistoryPanelProps) {
  const [selected, setSelected] = useState<Appointment | null>(null);
  const pastSessions = useMemo(
    () => partitionPastSessions(appointments),
    [appointments],
  );
  const groups = useMemo(
    () => groupPastSessionsByMonth(appointments),
    [appointments],
  );

  if (pastSessions.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center",
          className,
        )}
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-border/60 bg-background">
          <History className="size-5 text-muted-foreground" />
        </div>
        <p className="text-base font-medium">No session history</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {groups.map((group) => (
          <div key={group.key} className="space-y-3">
            <p className={dashboardTheme.sectionLabel}>
              {headingTitle(group.label)}
            </p>
            <Card className={dashboardTheme.card}>
              <CardContent className="divide-y divide-border/50 p-0">
                {group.items.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {getAppointmentTitle(appointment)}
                        </p>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {showClientName ? (
                          <>
                            {appointment.clientName}
                            {" · "}
                          </>
                        ) : null}
                        {appointment.scheduledAt
                          ? `${formatShortDate(appointment.scheduledAt)} at ${formatTimeLabel(appointment.scheduledAt)}`
                          : "Date unknown"}
                        {" · "}
                        {appointment.durationMinutes} min
                      </p>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {getSessionPreview(appointment)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setSelected(appointment)}
                    >
                      View details
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <MeetingDetailSheet
        appointment={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        showClientLink={showClientName}
      />
    </>
  );
}
