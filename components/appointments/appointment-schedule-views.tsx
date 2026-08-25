"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/appointments/types";
import {
  formatDayColumn,
  formatHourLabel,
  formatShortDate,
  formatTimeLabel,
  formatTimeRange,
  formatWeekRange,
  getAppointmentPosition,
  getAppointmentTitle,
  getHourLabels,
  getWeekDays,
  getWeekStart,
  HOUR_HEIGHT_PX,
  isDateInWeek,
  isSameDay,
  isToday,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  startOfDay,
} from "@/lib/appointments/display";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type AppointmentWeekCalendarProps = {
  appointments: Appointment[];
  weekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  onSelect?: (appointment: Appointment) => void;
};

export function AppointmentWeekCalendar({
  appointments,
  weekStart,
  onWeekChange,
  onSelect,
}: AppointmentWeekCalendarProps) {
  const weekDays = getWeekDays(weekStart);
  const hours = getHourLabels();
  const gridHeight = hours.length * HOUR_HEIGHT_PX;

  function appointmentsForDay(day: Date) {
    return appointments.filter(
      (appointment) =>
        appointment.scheduledAt &&
        isSameDay(new Date(appointment.scheduledAt), day),
    );
  }

  const visibleAppointments = weekDays.flatMap((day) =>
    appointmentsForDay(day),
  );
  const nextAppointment = appointments[0];

  function shiftWeek(direction: -1 | 1) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + direction * 7);
    onWeekChange(getWeekStart(next));
  }

  const showWeekHint =
    visibleAppointments.length === 0 &&
    nextAppointment?.scheduledAt &&
    !isDateInWeek(new Date(nextAppointment.scheduledAt), weekStart);

  return (
    <div className="space-y-3">
      {showWeekHint ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium">Next session isn&apos;t this week</p>
            <p className="text-sm text-muted-foreground">
              {nextAppointment.clientName} ·{" "}
              {getAppointmentTitle(nextAppointment)} ·{" "}
              {formatShortDate(nextAppointment.scheduledAt)} at{" "}
              {formatTimeLabel(nextAppointment.scheduledAt)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() =>
              onWeekChange(getWeekStart(new Date(nextAppointment.scheduledAt!)))
            }
          >
            View that week
          </Button>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {formatWeekRange(weekStart)}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous week"
            onClick={() => shiftWeek(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onWeekChange(getWeekStart(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next week"
            onClick={() => shiftWeek(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className={cn(dashboardTheme.card, "overflow-hidden rounded-xl")}>
        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-border/50">
          <div />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "border-l border-border/50 px-2 py-3 text-center",
                isToday(day) && "bg-primary/5",
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase",
                  isToday(day) && "text-primary",
                )}
              >
                {formatDayColumn(day)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground tabular-nums"
                style={{ top: index * HOUR_HEIGHT_PX }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {weekDays.map((day) => {
            const dayAppointments = appointmentsForDay(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative border-l border-border/50",
                  isToday(day) && "bg-primary/[0.03]",
                )}
                style={{ height: gridHeight }}
              >
                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute inset-x-0 border-t border-border/40"
                    style={{ top: index * HOUR_HEIGHT_PX }}
                  />
                ))}

                {dayAppointments.map((appointment) => {
                  if (!appointment.scheduledAt) {
                    return null;
                  }

                  const { top, height } = getAppointmentPosition(
                    appointment.scheduledAt,
                    appointment.durationMinutes,
                  );

                  if (
                    top < 0 ||
                    top >
                      (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR + 1) *
                        HOUR_HEIGHT_PX
                  ) {
                    return null;
                  }

                  const requested = appointment.status === "requested";

                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelect?.(appointment)}
                      className={cn(
                        "absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-colors",
                        requested
                          ? "border-amber-200/80 bg-amber-50 hover:bg-amber-100/80 dark:border-amber-900/40 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
                          : "border-primary/15 bg-primary/8 hover:bg-primary/12",
                      )}
                      style={{ top: top + 2, height }}
                    >
                      <p className="truncate text-xs font-semibold">
                        {appointment.clientName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {getAppointmentTitle(appointment)}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground tabular-nums">
                        {formatTimeLabel(appointment.scheduledAt)}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type AppointmentListRowProps = {
  appointment: Appointment;
  pending: boolean;
  onLog?: (appointment: Appointment) => void;
  onCancel?: (id: string) => void;
};

export function AppointmentListRow({
  appointment,
  pending,
  onLog,
  onCancel,
}: AppointmentListRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="w-24 shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
          {appointment.scheduledAt
            ? formatTimeLabel(appointment.scheduledAt)
            : "—"}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/clients/${appointment.clientId}`}
              className="truncate text-sm font-medium hover:underline"
            >
              {appointment.clientName}
            </Link>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="truncate text-sm text-foreground">
            {getAppointmentTitle(appointment)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatTimeRange(
              appointment.scheduledAt,
              appointment.durationMinutes,
            )}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onLog ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onLog(appointment)}
          >
            Log session
          </Button>
        ) : null}
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onCancel(appointment.id)}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}

type AppointmentDayTimelineProps = {
  appointments: Appointment[];
  pending: boolean;
  onLog: (appointment: Appointment) => void;
  onCancel: (id: string) => void;
};

export function AppointmentDayTimeline({
  appointments,
  pending,
  onLog,
  onCancel,
}: AppointmentDayTimelineProps) {
  const hours = getHourLabels();
  const gridHeight = hours.length * HOUR_HEIGHT_PX;

  return (
    <div className={cn(dashboardTheme.card, "overflow-hidden rounded-xl")}>
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)]">
        <div className="relative border-r border-border/50" style={{ height: gridHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground tabular-nums"
              style={{ top: index * HOUR_HEIGHT_PX }}
            >
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: gridHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute inset-x-0 border-t border-border/40"
              style={{ top: index * HOUR_HEIGHT_PX }}
            />
          ))}

          {appointments.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <p className="text-sm text-muted-foreground">
                No appointments scheduled for today.
              </p>
            </div>
          ) : (
            appointments.map((appointment) => {
              if (!appointment.scheduledAt) {
                return null;
              }

              const { top, height } = getAppointmentPosition(
                appointment.scheduledAt,
                appointment.durationMinutes,
              );

              return (
                <div
                  key={appointment.id}
                  className="absolute inset-x-3 rounded-xl border border-primary/15 bg-primary/8 p-3"
                  style={{ top: top + 2, height: Math.max(height, 72) }}
                >
                  <div className="flex h-full flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {getAppointmentTitle(appointment)}
                      </p>
                      <Link
                        href={`/clients/${appointment.clientId}`}
                        className="truncate text-sm hover:underline"
                      >
                        {appointment.clientName}
                      </Link>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatTimeRange(
                          appointment.scheduledAt,
                          appointment.durationMinutes,
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => onLog(appointment)}
                      >
                        Log session
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => onCancel(appointment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function groupAppointmentsByDay(appointments: Appointment[]) {
  const groups = new Map<string, Appointment[]>();

  for (const appointment of appointments) {
    if (!appointment.scheduledAt) {
      continue;
    }
    const key = startOfDay(new Date(appointment.scheduledAt)).toISOString();
    groups.set(key, [...(groups.get(key) ?? []), appointment]);
  }

  return Array.from(groups.entries()).map(([key, items]) => ({
    date: new Date(key),
    items,
  }));
}
