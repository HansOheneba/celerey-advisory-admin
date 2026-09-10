"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/appointments/types";
import {
  CALENDAR_GRID_INSET_Y,
  calendarHourLabelClass,
  formatGoogleDayHeader,
  formatGoogleEventTimeRange,
  formatGoogleWeekTitle,
  formatHourLabel,
  getAppointmentPosition,
  getAppointmentTitle,
  getCurrentTimeIndicatorOffset,
  getHourLabels,
  getWeekDays,
  getWeekStart,
  HOUR_HEIGHT_PX,
  isDateInWeek,
  isSameDay,
  isToday,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
} from "@/lib/appointments/display";
import { cn } from "@/lib/utils";

type GoogleWeekCalendarProps = {
  appointments: Appointment[];
  weekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  onSelect?: (appointment: Appointment) => void;
};

/** Roughly eight hour rows visible before vertical scroll kicks in. */
const CALENDAR_VIEWPORT_MAX_HEIGHT = "min(28rem, 52vh)";

function eventTone(status: Appointment["status"]) {
  if (status === "requested" || status === "proposed" || status === "counter_proposed") {
    return "border-[#8c80f8] bg-[#8c80f8]/10 text-[#151339] hover:bg-[#8c80f8]/15 dark:text-foreground";
  }
  return "border-[#8c80f8] bg-[#8c80f8] text-white hover:bg-[#7a6ef0]";
}

export function GoogleWeekCalendar({
  appointments,
  weekStart,
  onWeekChange,
  onSelect,
}: GoogleWeekCalendarProps) {
  const weekDays = getWeekDays(weekStart);
  const hours = getHourLabels();
  const gridHeight = hours.length * HOUR_HEIGHT_PX;
  const gridContentHeight = gridHeight + CALENDAR_GRID_INSET_Y * 2;
  const timeIndicatorTop = getCurrentTimeIndicatorOffset();
  const showTodayInWeek = weekDays.some((day) => isToday(day));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) {
      return;
    }

    const businessDayStart = CALENDAR_GRID_INSET_Y + 2 * HOUR_HEIGHT_PX;
    const scrollTarget =
      timeIndicatorTop !== null && showTodayInWeek
        ? Math.max(
            0,
            CALENDAR_GRID_INSET_Y +
              timeIndicatorTop -
              viewport.clientHeight / 3,
          )
        : businessDayStart;

    viewport.scrollTop = scrollTarget;
  }, [weekStart, timeIndicatorTop, showTodayInWeek]);

  function appointmentsForDay(day: Date) {
    return appointments.filter(
      (appointment) =>
        appointment.scheduledAt &&
        isSameDay(new Date(appointment.scheduledAt), day),
    );
  }

  function shiftWeek(direction: -1 | 1) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + direction * 7);
    onWeekChange(getWeekStart(next));
  }

  const nextInOtherWeek = appointments.find(
    (appointment) =>
      appointment.scheduledAt &&
      !isDateInWeek(new Date(appointment.scheduledAt), weekStart),
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onWeekChange(getWeekStart(new Date()))}
          >
            Today
          </Button>
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous week"
              onClick={() => shiftWeek(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next week"
              onClick={() => shiftWeek(1)}
            >
              <ChevronRight />
            </Button>
          </div>
          <p className="text-base font-medium tracking-tight">
            {formatGoogleWeekTitle(weekStart)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Week
          </span>
        </div>
      </div>

      {nextInOtherWeek?.scheduledAt &&
      weekDays.every((day) => appointmentsForDay(day).length === 0) ? (
        <div className="border-b border-border/50 bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
          Next: {nextInOtherWeek.clientName} ·{" "}
          {getAppointmentTitle(nextInOtherWeek)} ·{" "}
          <button
            type="button"
            className="font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() =>
              onWeekChange(getWeekStart(new Date(nextInOtherWeek.scheduledAt!)))
            }
          >
            Jump to that week
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-border/50 bg-card">
            <div className="flex items-end justify-end border-r border-border px-2 pb-2">
              <span className="text-[10px] font-medium text-muted-foreground">
                GMT
              </span>
            </div>
            {weekDays.map((day) => {
              const { weekday, dayNum } = formatGoogleDayHeader(day);
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex flex-col items-center border-l border-border py-2",
                    today && "bg-primary/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] font-medium tracking-wide text-muted-foreground",
                      today && "text-primary",
                    )}
                  >
                    {weekday}
                  </span>
                  <span
                    className={cn(
                      "mt-1 flex size-8 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                      today && "bg-primary text-primary-foreground",
                    )}
                  >
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            ref={scrollRef}
            className="overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: CALENDAR_VIEWPORT_MAX_HEIGHT }}
          >
            <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
            <div
              className="relative border-r border-border"
              style={{ height: gridContentHeight }}
            >
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  className={cn(
                    "absolute right-3 text-[11px] leading-none text-muted-foreground tabular-nums",
                    calendarHourLabelClass(index, hours.length),
                  )}
                  style={{
                    top: CALENDAR_GRID_INSET_Y + index * HOUR_HEIGHT_PX,
                  }}
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>

            {weekDays.map((day) => {
              const dayAppointments = appointmentsForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative border-l border-border",
                    today && "bg-primary/[0.02]",
                  )}
                  style={{ height: gridContentHeight }}
                >
                  {hours.map((hour, index) => (
                    <div
                      key={`${hour}-full`}
                      className="absolute inset-x-0 border-t border-border/30"
                      style={{
                        top: CALENDAR_GRID_INSET_Y + index * HOUR_HEIGHT_PX,
                      }}
                    />
                  ))}
                  {hours.map((hour, index) => (
                    <div
                      key={`${hour}-half`}
                      className="absolute inset-x-0 border-t border-dashed border-border/20"
                      style={{
                        top:
                          CALENDAR_GRID_INSET_Y +
                          index * HOUR_HEIGHT_PX +
                          HOUR_HEIGHT_PX / 2,
                      }}
                    />
                  ))}

                  {today && timeIndicatorTop !== null && showTodayInWeek ? (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10"
                      style={{
                        top: CALENDAR_GRID_INSET_Y + timeIndicatorTop,
                      }}
                    >
                      <div className="relative">
                        <div className="absolute -left-1 size-2 rounded-full bg-red-500" />
                        <div className="h-px bg-red-500" />
                      </div>
                    </div>
                  ) : null}

                  {dayAppointments.map((appointment) => {
                    if (!appointment.scheduledAt) {
                      return null;
                    }

                    const { top, height } = getAppointmentPosition(
                      appointment.scheduledAt,
                      appointment.durationMinutes,
                    );

                    const gridMax =
                      (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR + 1) *
                      HOUR_HEIGHT_PX;

                    if (top > gridMax) {
                      return null;
                    }

                    const clampedTop = Math.max(0, top);
                    const clampedHeight =
                      top < 0 ? Math.max(height + top, 28) : height;

                    const filled =
                      appointment.status !== "requested" &&
                      appointment.status !== "proposed" &&
                      appointment.status !== "counter_proposed";

                    return (
                      <button
                        key={appointment.id}
                        type="button"
                        onClick={() => onSelect?.(appointment)}
                        className={cn(
                          "absolute inset-x-1 z-[1] overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm transition-[filter,transform]",
                          "hover:brightness-[0.97] active:scale-[0.99]",
                          eventTone(appointment.status),
                        )}
                        style={{
                          top: CALENDAR_GRID_INSET_Y + clampedTop + 1,
                          height: Math.max(clampedHeight - 2, 28),
                        }}
                      >
                        <p className="truncate text-xs font-semibold leading-tight">
                          {getAppointmentTitle(appointment)}
                        </p>
                        <p
                          className={cn(
                            "truncate text-[10px] leading-tight",
                            filled ? "text-white/90" : "text-muted-foreground",
                          )}
                        >
                          {formatGoogleEventTimeRange(
                            appointment.scheduledAt,
                            appointment.durationMinutes,
                          )}
                        </p>
                        {height > 44 ? (
                          <p
                            className={cn(
                              "mt-0.5 truncate text-[10px]",
                              filled ? "text-white/80" : "text-muted-foreground",
                            )}
                          >
                            {appointment.clientName}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
