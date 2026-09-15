"use client";

import Link from "next/link";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { useEffect, useMemo, useState, useTransition } from "react";
import { NotebookText } from "lucide-react";
import { toast } from "sonner";
import {
  confirmAppointmentAction,
  createAppointmentAction,
  logAppointmentAction,
  updateAppointmentStatusAction,
} from "@/app/actions/appointments";
import { AppointmentDetailSheet } from "@/components/appointments/appointment-detail-sheet";
import { AppointmentSummaryStrip } from "@/components/appointments/appointment-summary-strip";
import { CounterProposeDialog } from "@/components/appointments/counter-propose-dialog";
import { GoogleWeekCalendar } from "@/components/appointments/google-week-calendar";
import { LogSessionDialog } from "@/components/appointments/log-session-dialog";
import { MeetingNegotiationCard } from "@/components/appointments/meeting-negotiation-card";
import { ScheduleAppointmentDialog } from "@/components/appointments/schedule-appointment-dialog";
import { Button } from "@/components/ui/button";
import {
  computeScheduleStats,
  formatHeaderDate,
  formatShortDate,
  formatTimeLabel,
  getInitialWeekStart,
  getNextScheduledAppointment,
  getWeekStart,
  partitionSchedule,
} from "@/lib/appointments/display";
import type {
  Appointment,
  AppointmentType,
  SessionLogInput,
} from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";

type AppointmentsWorkspaceProps = {
  clients: Client[];
  initialAppointments: Appointment[];
};

export function AppointmentsWorkspace({
  clients,
  initialAppointments,
}: AppointmentsWorkspaceProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pending, startTransition] = useTransition();
  const [logging, setLogging] = useState<Appointment | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [countering, setCountering] = useState<Appointment | null>(null);
  const [weekStart, setWeekStart] = useState(() =>
    getInitialWeekStart(initialAppointments),
  );

  useEffect(() => {
    setAppointments(initialAppointments);
    setWeekStart(getInitialWeekStart(initialAppointments));
  }, [initialAppointments]);

  const stats = useMemo(
    () => computeScheduleStats(appointments),
    [appointments],
  );
  const { requested, calendarItems } = useMemo(
    () => partitionSchedule(appointments),
    [appointments],
  );
  const nextAppointment = useMemo(
    () => getNextScheduledAppointment(appointments),
    [appointments],
  );

  const todayDate = new Date();

  function handleSchedule(input: {
    clientId: string;
    type: AppointmentType;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  }) {
    startTransition(async () => {
      const result = await createAppointmentAction(input);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        [...current, result.appointment].sort(
          (a, b) =>
            (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0) -
            (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0),
        ),
      );
      if (result.appointment.scheduledAt) {
        setWeekStart(getWeekStart(new Date(result.appointment.scheduledAt)));
      }
      toast.success("Appointment scheduled");
    });
  }

  function setStatus(id: string, status: "cancelled") {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointmentId: id,
        status,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) => (item.id === id ? result.appointment : item)),
      );
      setSelected(null);
      toast.success("Appointment cancelled");
    });
  }

  function acceptNegotiation(id: string) {
    startTransition(async () => {
      const result = await confirmAppointmentAction({ appointmentId: id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === id ? result.appointment : item,
        ),
      );

      if (result.appointment.scheduledAt) {
        setWeekStart(getWeekStart(new Date(result.appointment.scheduledAt)));
      }

      toast.success("Meeting accepted · added to calendar");
    });
  }

  function counterPropose(input: {
    appointmentId: string;
    scheduledAt: string;
  }) {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointmentId: input.appointmentId,
        status: "counter_proposed",
        scheduledAt: input.scheduledAt,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === input.appointmentId ? result.appointment : item,
        ),
      );
      setCountering(null);
      toast.success("Counter-proposal sent");
    });
  }

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
      setSelected(null);
      toast.success("Session logged · view in Sessions");
    });
  }

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="space-y-1">
            <h2 className={dashboardTheme.pageTitle}>Appointments</h2>
            <p className={dashboardTheme.pageDescription}>
              Schedule and manage client meetings. Session logs and notes live
              under Sessions.
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-3 border-t border-border pt-3">
            <div className="min-w-[5.5rem] space-y-0.5 border-r border-border pr-3">
              <SectionEyebrow>Today</SectionEyebrow>
              <p className="text-sm font-semibold text-foreground">
                {formatHeaderDate(todayDate)}
              </p>
            </div>
            <div
              className={cn(
                "min-w-[5.5rem] space-y-0.5 border-r border-border pr-3",
                stats.requests > 0 && "text-foreground",
              )}
            >
              <SectionEyebrow>Requests</SectionEyebrow>
              <p className="text-sm font-semibold tabular-nums">
                {stats.requests}{" "}
                <span className="font-normal text-muted-foreground">
                  awaiting
                </span>
              </p>
            </div>
            {nextAppointment?.scheduledAt ? (
              <div className="min-w-0 flex-1 space-y-0.5">
                <SectionEyebrow>Next appointment</SectionEyebrow>
                <p className="text-sm leading-snug">
                  <span className="font-semibold text-foreground">
                    {nextAppointment.clientName}
                  </span>
                  <span className="mx-1.5 text-border">·</span>
                  <span className="text-muted-foreground">
                    {formatShortDate(nextAppointment.scheduledAt)} at{" "}
                    {formatTimeLabel(nextAppointment.scheduledAt)}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/sessions" />}>
            <NotebookText />
            View sessions
          </Button>
          <ScheduleAppointmentDialog
            clients={clients}
            onSchedule={handleSchedule}
            pending={pending}
          />
        </div>
      </section>

      <AppointmentSummaryStrip stats={stats} sessionsHref="/sessions" />

      {requested.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <SectionEyebrow>Action required</SectionEyebrow>
              <h3 className="text-base font-semibold tracking-tight">
                Meeting negotiations
              </h3>
            </div>
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {requested.length}
            </span>
          </div>
          <div className="space-y-2">
            {requested.map((appointment) => (
              <MeetingNegotiationCard
                key={appointment.id}
                appointment={appointment}
                pending={pending}
                onAccept={acceptNegotiation}
                onDecline={(id) => setStatus(id, "cancelled")}
                onCounter={setCountering}
              />
            ))}
          </div>
        </section>
      ) : null}

      <GoogleWeekCalendar
        appointments={calendarItems}
        weekStart={weekStart}
        onWeekChange={setWeekStart}
        onSelect={setSelected}
      />

      <AppointmentDetailSheet
        appointment={selected}
        open={selected !== null}
        pending={pending}
        onClose={() => setSelected(null)}
        onCancel={(id) => setStatus(id, "cancelled")}
        onLog={(appointment) => {
          setSelected(null);
          setLogging(appointment);
        }}
      />

      <LogSessionDialog
        appointment={logging}
        pending={pending}
        onClose={() => setLogging(null)}
        onSubmit={handleLog}
      />

      <CounterProposeDialog
        appointment={countering}
        open={countering !== null}
        pending={pending}
        onClose={() => setCountering(null)}
        onSubmit={counterPropose}
      />
    </div>
  );
}
