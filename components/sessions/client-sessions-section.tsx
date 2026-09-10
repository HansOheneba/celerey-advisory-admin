"use client";

import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { SessionHistoryPanel } from "@/components/appointments/session-history-panel";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/appointments/types";
import { partitionPastSessions } from "@/lib/appointments/display";

type ClientSessionsSectionProps = {
  clientId: string;
  appointments: Appointment[];
};

export function ClientSessionsSection({
  clientId,
  appointments,
}: ClientSessionsSectionProps) {
  const pastCount = partitionPastSessions(appointments).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pastCount} recorded session{pastCount === 1 ? "" : "s"} for
          compliance and client history.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link href="/appointments" />}>
            <CalendarPlus />
            Schedule appointment
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/sessions?client=${clientId}`} />}
          >
            View all sessions
          </Button>
        </div>
      </div>
      <SessionHistoryPanel
        appointments={appointments}
        showClientName={false}
        emptyMessage="No sessions logged yet. Schedule a meeting from Appointments, then log the session or publish AI notes."
      />
    </div>
  );
}
