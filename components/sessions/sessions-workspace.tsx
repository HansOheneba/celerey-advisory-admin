"use client";

import Link from "next/link";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import { logAppointmentAction } from "@/app/actions/appointments";
import { LogSessionDialog } from "@/components/appointments/log-session-dialog";
import { SessionHistoryPanel } from "@/components/appointments/session-history-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  partitionNotesReview,
  partitionPastSessions,
} from "@/lib/appointments/display";
import type { Appointment, SessionLogInput } from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { Client } from "@/types/client";

type SessionsWorkspaceProps = {
  clients: Client[];
  initialAppointments: Appointment[];
  initialClientId?: string;
};

export function SessionsWorkspace({
  clients,
  initialAppointments,
  initialClientId,
}: SessionsWorkspaceProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [clientFilter, setClientFilter] = useState(initialClientId ?? "all");
  const [logging, setLogging] = useState<Appointment | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const scopedAppointments = useMemo(() => {
    if (clientFilter === "all") {
      return appointments;
    }
    return appointments.filter(
      (appointment) => appointment.clientId === clientFilter,
    );
  }, [appointments, clientFilter]);

  const pastSessions = useMemo(
    () => partitionPastSessions(scopedAppointments),
    [scopedAppointments],
  );
  const pendingReview = useMemo(
    () => partitionNotesReview(scopedAppointments),
    [scopedAppointments],
  );

  function handleLog(input: SessionLogInput) {
    startTransition(async () => {
      const result = await logAppointmentAction(input);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === result.appointment.id ? result.appointment : item,
        ),
      );
      setLogging(null);
      toast.success("Session logged");
    });
  }

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <SectionEyebrow>Compliance</SectionEyebrow>
          <h2 className={dashboardTheme.pageTitle}>Sessions</h2>
          <p className={dashboardTheme.pageDescription}>
            Advisory session records, logs, and published notes for your client
            book.
          </p>
        </div>
        <Button render={<Link href="/appointments" />}>
          <CalendarPlus />
          Schedule appointment
        </Button>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={cnStatCard()}>
          <SectionEyebrow>Total sessions</SectionEyebrow>
          <p className="mt-1 text-2xl font-medium tabular-nums">
            {pastSessions.length}
          </p>
        </div>
        <div className={cnStatCard()}>
          <SectionEyebrow>Pending review</SectionEyebrow>
          <p className="mt-1 text-2xl font-medium tabular-nums">
            {pendingReview.length}
          </p>
        </div>
        <div className={cnStatCard()}>
          <SectionEyebrow>Clients</SectionEyebrow>
          <p className="mt-1 text-2xl font-medium tabular-nums">
            {clients.length}
          </p>
        </div>
        <div className={cnStatCard()}>
          <SectionEyebrow>Filter</SectionEyebrow>
          <Select
            value={clientFilter}
            onValueChange={(value) => setClientFilter(value ?? "all")}
          >
            <SelectTrigger className="mt-1 h-9 w-full">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {pendingReview.length > 0 ? (
        <section className="space-y-3">
          <div>
            <SectionEyebrow>Review queue</SectionEyebrow>
            <h3 className="text-base font-semibold tracking-tight">
              Meeting notes to review
            </h3>
          </div>
          <div className="space-y-3">
            {pendingReview.map((appointment) => (
              <Card key={appointment.id} className={dashboardTheme.card}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{appointment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.clientName} · AI draft ready
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    render={
                      <Link href={`/sessions/review/${appointment.id}`} />
                    }
                  >
                    Review & publish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div>
          <SectionEyebrow>Records</SectionEyebrow>
          <h3 className="text-base font-semibold tracking-tight">
            Session history
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {clientFilter === "all"
              ? "All completed sessions across your assigned clients."
              : "Sessions for this client only."}
          </p>
        </div>
        <SessionHistoryPanel
          appointments={scopedAppointments}
          emptyMessage="No sessions yet. Schedule a meeting from Appointments, then log the session or publish AI notes after review."
        />
      </section>

      <LogSessionDialog
        appointment={logging}
        pending={pending}
        onClose={() => setLogging(null)}
        onSubmit={handleLog}
      />

    </div>
  );
}

function cnStatCard() {
  return `${dashboardTheme.card} rounded-xl px-4 py-3`;
}
