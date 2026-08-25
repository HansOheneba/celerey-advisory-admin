import {
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments/types";
import { getInitials } from "@/lib/format";

export const SCHEDULE_START_HOUR = 8;
export const SCHEDULE_END_HOUR = 18;
export const HOUR_HEIGHT_PX = 52;

export function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type ScheduleStats = {
  today: number;
  thisWeek: number;
  requests: number;
  completedThisMonth: number;
};

export type ScheduleView = "calendar" | "list";

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export function getWeekStart(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });
}

export function formatHeaderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTodayHeading(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDayColumn(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
  })
    .format(date)
    .toUpperCase();
}

export function formatWeekRange(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const start = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(weekStart);
  const end = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(weekEnd);

  return `Week of ${start} – ${end}`;
}

export function formatLongDate(iso: string | null) {
  if (!iso) {
    return "Flexible timing";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatShortDate(iso: string | null) {
  if (!iso) {
    return "Flexible";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatTimeLabel(iso: string | null) {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeRange(
  startIso: string | null,
  durationMinutes: number,
) {
  if (!startIso) {
    return `— · ${durationMinutes} min`;
  }

  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(start)} – ${formatter.format(end)} · ${durationMinutes} min`;
}

export function formatDayLabel(iso: string | null) {
  if (!iso) {
    return "Unscheduled";
  }

  const date = new Date(iso);
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getAppointmentTitle(appointment: Appointment) {
  if (appointment.title.trim()) {
    return appointment.title;
  }

  return APPOINTMENT_TYPE_LABELS[appointment.type];
}

export function getClientInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  if (parts.length === 1) {
    return getInitials(parts[0], "");
  }
  return getInitials(parts[0], parts[parts.length - 1]);
}

export function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "requested":
      return "Requested";
    case "upcoming":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function sortByScheduledAt(items: Appointment[]) {
  return [...items].sort(
    (a, b) =>
      (a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.POSITIVE_INFINITY) -
      (b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.POSITIVE_INFINITY),
  );
}

export function computeScheduleStats(appointments: Appointment[]): ScheduleStats {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const scheduled = appointments.filter(
    (appointment) =>
      appointment.scheduledAt &&
      (appointment.status === "upcoming" || appointment.status === "requested"),
  );

  return {
    today: scheduled.filter((appointment) =>
      isSameDay(new Date(appointment.scheduledAt!), todayStart),
    ).length,
    thisWeek: scheduled.filter((appointment) => {
      const date = new Date(appointment.scheduledAt!);
      return date >= weekStart && date < weekEnd;
    }).length,
    requests: appointments.filter(
      (appointment) => appointment.status === "requested",
    ).length,
    completedThisMonth: appointments.filter((appointment) => {
      if (appointment.status !== "completed" || !appointment.scheduledAt) {
        return false;
      }
      const date = new Date(appointment.scheduledAt);
      return date >= monthStart && date <= monthEnd;
    }).length,
  };
}

export function isDateInWeek(date: Date, weekStart: Date) {
  const start = startOfDay(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const target = startOfDay(date);
  return target >= start && target < end;
}

export function getNextScheduledAppointment(appointments: Appointment[]) {
  return sortByScheduledAt(
    appointments.filter(
      (appointment) =>
        appointment.scheduledAt &&
        (appointment.status === "upcoming" ||
          appointment.status === "requested"),
    ),
  )[0];
}

export function getInitialWeekStart(appointments: Appointment[]) {
  const currentWeekStart = getWeekStart(new Date());
  const scheduled = sortByScheduledAt(
    appointments.filter(
      (appointment) =>
        appointment.scheduledAt &&
        (appointment.status === "upcoming" ||
          appointment.status === "requested"),
    ),
  );

  const inCurrentWeek = scheduled.filter((appointment) =>
    isDateInWeek(new Date(appointment.scheduledAt!), currentWeekStart),
  );

  if (inCurrentWeek.length > 0) {
    return currentWeekStart;
  }

  const next = scheduled.find(
    (appointment) =>
      new Date(appointment.scheduledAt!).getTime() >=
      currentWeekStart.getTime(),
  );

  if (next?.scheduledAt) {
    return getWeekStart(new Date(next.scheduledAt));
  }

  return currentWeekStart;
}

export function partitionSchedule(appointments: Appointment[]) {
  const now = startOfDay(new Date());
  const scheduled = sortByScheduledAt(
    appointments.filter(
      (appointment) =>
        appointment.status === "upcoming" && appointment.scheduledAt,
    ),
  );

  const today = scheduled.filter((appointment) =>
    isSameDay(new Date(appointment.scheduledAt!), now),
  );

  const upcoming = scheduled.filter((appointment) => {
    const date = startOfDay(new Date(appointment.scheduledAt!));
    return date.getTime() > now.getTime();
  });

  const requested = sortByScheduledAt(
    appointments.filter((appointment) => appointment.status === "requested"),
  );

  const calendarItems = sortByScheduledAt(
    appointments.filter(
      (appointment) =>
        appointment.scheduledAt &&
        (appointment.status === "upcoming" ||
          appointment.status === "requested"),
    ),
  );

  return { today, upcoming, requested, calendarItems };
}

export function getHourLabels() {
  return Array.from(
    { length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR + 1 },
    (_, index) => SCHEDULE_START_HOUR + index,
  );
}

export function formatHourLabel(hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
  }).format(date);
}

export function getAppointmentPosition(
  scheduledAt: string,
  durationMinutes: number,
) {
  const start = new Date(scheduledAt);
  const startMinutes =
    start.getHours() * 60 + start.getMinutes() - SCHEDULE_START_HOUR * 60;
  const top = (startMinutes / 60) * HOUR_HEIGHT_PX;
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT_PX - 4, 28);

  return { top, height };
}
