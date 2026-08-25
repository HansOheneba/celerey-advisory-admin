"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, List } from "lucide-react";
import { toast } from "sonner";
import {
  confirmAppointmentAction,
  createAppointmentAction,
  logAppointmentAction,
  updateAppointmentStatusAction,
} from "@/app/actions/appointments";
import { AppointmentRequestCard } from "@/components/appointments/appointment-request-card";
import {
  AppointmentDayTimeline,
  AppointmentListRow,
  AppointmentWeekCalendar,
  groupAppointmentsByDay,
} from "@/components/appointments/appointment-schedule-views";
import { AppointmentSummaryStrip } from "@/components/appointments/appointment-summary-strip";
import { LogSessionDialog } from "@/components/appointments/log-session-dialog";
import { ScheduleAppointmentDialog } from "@/components/appointments/schedule-appointment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  computeScheduleStats,
  formatDayLabel,
  formatHeaderDate,
  formatShortDate,
  formatTimeLabel,
  formatTodayHeading,
  getInitialWeekStart,
  getNextScheduledAppointment,
  getWeekStart,
  partitionSchedule,
  type ScheduleView,
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

function ScheduleViewToggle({
  value,
  onChange,
}: {
  value: ScheduleView;
  onChange: (value: ScheduleView) => void;
}) {
  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1">
      <Button
        type="button"
        size="sm"
        variant={value === "calendar" ? "secondary" : "ghost"}
        className={cn(value === "calendar" && "shadow-sm")}
        onClick={() => onChange("calendar")}
      >
        <CalendarDays />
        Calendar
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "list" ? "secondary" : "ghost"}
        className={cn(value === "list" && "shadow-sm")}
        onClick={() => onChange("list")}
      >
        <List />
        List
      </Button>
    </div>
  );
}

export function AppointmentsWorkspace({
  clients,
  initialAppointments,
}: AppointmentsWorkspaceProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pending, startTransition] = useTransition();
  const [logging, setLogging] = useState<Appointment | null>(null);
  const [view, setView] = useState<ScheduleView>("calendar");
  const [weekStart, setWeekStart] = useState(() =>
    getInitialWeekStart(initialAppointments),
  );

  const stats = useMemo(
    () => computeScheduleStats(appointments),
    [appointments],
  );
  const { today, upcoming, requested, calendarItems } = useMemo(
    () => partitionSchedule(appointments),
    [appointments],
  );
  const upcomingGroups = useMemo(
    () => groupAppointmentsByDay(upcoming),
    [upcoming],
  );
  const nextAppointment = useMemo(
    () => getNextScheduledAppointment(appointments),
    [appointments],
  );

  const todayDate = new Date();
  const hasSchedule =
    requested.length > 0 || today.length > 0 || upcoming.length > 0;

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
        setView("calendar");
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
      toast.success("Appointment cancelled");
    });
  }

  function confirmRequest(id: string) {
    startTransition(async () => {
      const result = await confirmAppointmentAction({ appointmentId: id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const previous = appointments.find((item) => item.id === id);
      const confirmed = {
        ...result.appointment,
        scheduledAt:
          result.appointment.scheduledAt ?? previous?.scheduledAt ?? null,
        status:
          result.appointment.status === "requested"
            ? "upcoming"
            : result.appointment.status,
      };

      setAppointments((current) =>
        current.map((item) => (item.id === id ? confirmed : item)),
      );

      if (confirmed.scheduledAt) {
        setWeekStart(getWeekStart(new Date(confirmed.scheduledAt)));
        setView("calendar");
      }

      toast.success("Session confirmed");
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
      toast.success("Session logged");
    });
  }

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className={dashboardTheme.sectionLabel}>Schedule</p>
          <h2 className={dashboardTheme.pageTitle}>Appointments</h2>
          <p className={dashboardTheme.pageDescription}>
            Manage your client sessions and upcoming advisory meetings.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Today</span>
            <span className="mx-2 text-border">·</span>
            <span className="font-semibold text-foreground">
              {formatHeaderDate(todayDate)}
            </span>
            <span className="mx-2 text-border">·</span>
            <span className="font-semibold text-foreground">
              {stats.requests}
            </span>{" "}
            request{stats.requests === 1 ? "" : "s"}
            <span className="mx-2 text-border">·</span>
            <span className="font-semibold text-foreground">
              {today.length + upcoming.length}
            </span>{" "}
            upcoming
            {nextAppointment?.scheduledAt ? (
              <>
                <span className="mx-2 text-border">·</span>
                <span className="font-medium text-foreground">Next:</span>{" "}
                <span className="font-semibold text-foreground">
                  {nextAppointment.clientName}
                </span>
                <span className="mx-2 text-border">·</span>
                <span className="font-semibold text-foreground">
                  {formatShortDate(nextAppointment.scheduledAt)} at{" "}
                  {formatTimeLabel(nextAppointment.scheduledAt)}
                </span>
              </>
            ) : null}
          </p>
        </div>
        <ScheduleAppointmentDialog
          clients={clients}
          onSchedule={handleSchedule}
          pending={pending}
        />
      </section>

      <AppointmentSummaryStrip stats={stats} />

      {requested.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className={dashboardTheme.sectionLabel}>Action required</p>
              <h3 className="text-base font-semibold tracking-tight">
                Session requests
              </h3>
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {requested.length}
            </span>
          </div>
          <div className="space-y-3">
            {requested.map((appointment) => (
              <AppointmentRequestCard
                key={appointment.id}
                appointment={appointment}
                pending={pending}
                onConfirm={confirmRequest}
                onDecline={(id) => setStatus(id, "cancelled")}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={dashboardTheme.sectionLabel}>Your week</p>
            <h3 className="text-base font-semibold tracking-tight">
              {view === "calendar" ? "Calendar" : "Today"}
            </h3>
          </div>
          <ScheduleViewToggle value={view} onChange={setView} />
        </div>

        {view === "calendar" ? (
          <AppointmentWeekCalendar
            appointments={calendarItems}
            weekStart={weekStart}
            onWeekChange={setWeekStart}
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <p className={dashboardTheme.sectionLabel}>Today</p>
                <h4 className="text-sm font-semibold tracking-tight uppercase">
                  {formatTodayHeading(todayDate)}
                </h4>
              </div>
              <AppointmentDayTimeline
                appointments={today}
                pending={pending}
                onLog={setLogging}
                onCancel={(id) => setStatus(id, "cancelled")}
              />
            </div>

            {upcomingGroups.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className={dashboardTheme.sectionLabel}>Coming up</p>
                    <h4 className="text-sm font-semibold tracking-tight">
                      Upcoming
                    </h4>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {upcoming.length} session
                    {upcoming.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingGroups.map(({ date, items }) => (
                    <Card key={date.toISOString()} className={dashboardTheme.card}>
                      <CardContent className="p-0">
                        <div className="border-b border-border/50 px-4 py-3">
                          <p className="text-sm font-semibold">
                            {formatDayLabel(date.toISOString())}
                          </p>
                        </div>
                        <div className="divide-y divide-border/50">
                          {items.map((appointment) => (
                            <AppointmentListRow
                              key={appointment.id}
                              appointment={appointment}
                              pending={pending}
                              onLog={setLogging}
                              onCancel={(id) => setStatus(id, "cancelled")}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {!hasSchedule ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40">
                  <CalendarDays className="size-5 text-muted-foreground" />
                </div>
                <p className="text-base font-medium">Your schedule is clear</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  No upcoming appointments. Schedule a session or wait for a
                  client request.
                </p>
                <div className="mt-6">
                  <ScheduleAppointmentDialog
                    clients={clients}
                    onSchedule={handleSchedule}
                    pending={pending}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
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
