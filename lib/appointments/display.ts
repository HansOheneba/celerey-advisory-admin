import {
  APPOINTMENT_TYPE_LABELS,
  NEGOTIATION_STATUSES,
  SCHEDULED_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments/types";
import { getInitials } from "@/lib/format";

export const SCHEDULE_START_HOUR = 6;
export const SCHEDULE_END_HOUR = 21;
export const HOUR_HEIGHT_PX = 56;
/** Top/bottom inset so edge hour labels are not clipped in the scroll viewport. */
export const CALENDAR_GRID_INSET_Y = 12;

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

export const PAST_SESSION_STATUSES: AppointmentStatus[] = [
  "completed",
  "published",
];

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

export function formatGoogleDayHeader(date: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" })
    .format(date)
    .toUpperCase();
  const dayNum = date.getDate();
  return { weekday, dayNum };
}

export function formatGoogleWeekTitle(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    weekStart,
  );
  const endMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    weekEnd,
  );
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${weekStart.getDate()}, ${startYear} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`;
  }

  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${startYear}`;
  }

  return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${startYear}`;
}

export function formatGoogleEventTimeRange(
  scheduledAt: string,
  durationMinutes: number,
) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function getCurrentTimeIndicatorOffset(now = new Date()) {
  const hours = now.getHours() + now.getMinutes() / 60;
  if (hours < SCHEDULE_START_HOUR || hours > SCHEDULE_END_HOUR) {
    return null;
  }
  return (hours - SCHEDULE_START_HOUR) * HOUR_HEIGHT_PX;
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
    case "proposed":
      return "Proposed";
    case "counter_proposed":
      return "Counter-proposed";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "upcoming":
    case "scheduled":
      return "Scheduled";
    case "in_progress":
      return "In progress";
    case "processing_notes":
      return "Processing notes";
    case "pending_review":
      return "Pending review";
    case "published":
      return "Published";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function isNegotiationStatus(status: AppointmentStatus) {
  return NEGOTIATION_STATUSES.includes(status);
}

export function isScheduledStatus(status: AppointmentStatus) {
  return SCHEDULED_STATUSES.includes(status);
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
      appointment.scheduledAt && isScheduledStatus(appointment.status),
  );

  return {
    today: scheduled.filter((appointment) =>
      isSameDay(new Date(appointment.scheduledAt!), todayStart),
    ).length,
    thisWeek: scheduled.filter((appointment) => {
      const date = new Date(appointment.scheduledAt!);
      return date >= weekStart && date < weekEnd;
    }).length,
    requests: appointments.filter((appointment) =>
      isNegotiationStatus(appointment.status),
    ).length,
    completedThisMonth: appointments.filter((appointment) => {
      if (
        (appointment.status !== "completed" &&
          appointment.status !== "published") ||
        !appointment.scheduledAt
      ) {
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
        appointment.scheduledAt && isScheduledStatus(appointment.status),
    ),
  )[0];
}

export function getInitialWeekStart(appointments: Appointment[]) {
  const currentWeekStart = getWeekStart(new Date());
  const scheduled = sortByScheduledAt(
    appointments.filter(
      (appointment) =>
        appointment.scheduledAt && isScheduledStatus(appointment.status),
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
        isScheduledStatus(appointment.status) && appointment.scheduledAt,
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
    appointments.filter((appointment) =>
      isNegotiationStatus(appointment.status),
    ),
  );

  const calendarItems = sortByScheduledAt(
    appointments.filter(
      (appointment) =>
        appointment.scheduledAt &&
        (isScheduledStatus(appointment.status) ||
          isNegotiationStatus(appointment.status)),
    ),
  );

  return { today, upcoming, requested, calendarItems };
}

export function partitionNotesReview(appointments: Appointment[]) {
  return appointments.filter(
    (appointment) => appointment.status === "pending_review",
  );
}

export function isPastSessionStatus(status: AppointmentStatus) {
  return PAST_SESSION_STATUSES.includes(status);
}

export function hasSessionRecord(appointment: Appointment) {
  return Boolean(appointment.log ?? appointment.aiNotesPublished);
}

export function partitionPastSessions(appointments: Appointment[]) {
  return [...appointments]
    .filter(
      (appointment) =>
        isPastSessionStatus(appointment.status) && appointment.scheduledAt,
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime(),
    );
}

export function getSessionPreview(appointment: Appointment) {
  if (appointment.log?.advisorAssessment) {
    return appointment.log.advisorAssessment;
  }
  if (appointment.log?.sessionNotes) {
    return appointment.log.sessionNotes;
  }
  if (appointment.aiNotesPublished?.summary) {
    return appointment.aiNotesPublished.summary;
  }
  return "Session completed — open for details.";
}

export function formatMonthGroupLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function groupPastSessionsByMonth(appointments: Appointment[]) {
  const groups = new Map<string, Appointment[]>();

  for (const appointment of partitionPastSessions(appointments)) {
    if (!appointment.scheduledAt) {
      continue;
    }
    const date = new Date(appointment.scheduledAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    groups.set(key, [...(groups.get(key) ?? []), appointment]);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({
      key,
      label: formatMonthGroupLabel(new Date(`${key}-01T12:00:00`)),
      items,
    }));
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

export function calendarHourLabelClass(index: number, total: number) {
  if (index === 0) {
    return "translate-y-0";
  }
  if (index === total - 1) {
    return "-translate-y-full";
  }
  return "-translate-y-1/2";
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
