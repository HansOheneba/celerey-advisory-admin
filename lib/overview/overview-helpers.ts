import type { Appointment } from "@/lib/appointments/types";
import {
  CLIENT_SEGMENT_LABELS,
  type ClientSegment,
  type DemoAlert,
  type DemoClientRecord,
} from "@/lib/demo/types";
import type { Task } from "@/lib/tasks/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AttentionPriority = "High" | "Medium" | "Low";

export type AttentionRow = {
  id: string;
  priority: AttentionPriority;
  label: string;
  reason: string;
  due: string;
  href: string;
  action: string;
};

export type BookSegmentRow = {
  segment: ClientSegment;
  label: string;
  aua: number;
  clientCount: number;
  sharePct: number;
};

export type UpcomingItem = {
  id: string;
  kind: "appointment" | "task";
  timeLabel: string;
  sortAt: number;
  title: string;
  subtitle: string;
  href: string;
};

const SEVERITY_PRIORITY: Record<
  DemoAlert["severity"],
  AttentionPriority
> = {
  critical: "High",
  warning: "Medium",
  info: "Low",
};

const SEVERITY_ORDER: Record<AttentionPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export function overviewGreeting(firstName?: string): string {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = firstName?.trim();

  if (name) {
    return `${salutation}, ${name}. Here's what needs your attention across your book.`;
  }

  return `${salutation}. Here's what needs your attention across your book.`;
}

export function alertDueLabel(alert: DemoAlert): string {
  if (alert.kind === "review_overdue") {
    const match = alert.detail.match(/(\d+) days past due/);
    if (match) {
      return `${match[1]} days overdue`;
    }
    return "Overdue";
  }

  if (alert.kind === "task_due") {
    return "Due today";
  }

  const created = Date.parse(alert.createdAt);
  if (!Number.isFinite(created)) {
    return "Open";
  }

  const days = Math.round((Date.now() - created) / DAY_MS);
  if (days <= 0) {
    return "Today";
  }
  if (days === 1) {
    return "Yesterday";
  }
  return `${days} days ago`;
}

export function alertActionLabel(alert: DemoAlert): string {
  switch (alert.kind) {
    case "review_overdue":
      return "Review";
    case "risk_breach":
      return "Portfolio";
    case "client_message":
      return "Reply";
    case "task_due":
      return "Task";
    default:
      return "View";
  }
}

export function buildAttentionRows(alerts: DemoAlert[]): AttentionRow[] {
  return [...alerts]
    .sort((a, b) => {
      const priorityDelta =
        SEVERITY_ORDER[SEVERITY_PRIORITY[a.severity]] -
        SEVERITY_ORDER[SEVERITY_PRIORITY[b.severity]];
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    })
    .map((alert) => ({
      id: alert.id,
      priority: SEVERITY_PRIORITY[alert.severity],
      label: alert.clientName ?? alert.title,
      reason: alert.clientName ? alert.title : alert.detail,
      due: alertDueLabel(alert),
      href: alert.clientId
        ? `/clients/${alert.clientId}${alert.workspaceTab ? `?tab=${alert.workspaceTab}` : ""}`
        : "/clients",
      action: alertActionLabel(alert),
    }));
}

export function computeBookComposition(
  records: DemoClientRecord[],
): BookSegmentRow[] {
  const bySegment = new Map<
    ClientSegment,
    { aua: number; clientCount: number }
  >();

  for (const record of records) {
    const existing = bySegment.get(record.segment);
    if (existing) {
      existing.aua += record.client.aua;
      existing.clientCount += 1;
    } else {
      bySegment.set(record.segment, {
        aua: record.client.aua,
        clientCount: 1,
      });
    }
  }

  const totalAua = records.reduce(
    (total, record) => total + record.client.aua,
    0,
  );

  return [...bySegment.entries()]
    .map(([segment, stats]) => ({
      segment,
      label: CLIENT_SEGMENT_LABELS[segment],
      aua: stats.aua,
      clientCount: stats.clientCount,
      sharePct:
        totalAua > 0 ? Math.round((stats.aua / totalAua) * 100) : 0,
    }))
    .sort((a, b) => b.aua - a.aua);
}

function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / DAY_MS);

  if (diff === 0) {
    return "Today";
  }
  if (diff === 1) {
    return "Tomorrow";
  }
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function buildUpcomingItems(
  appointments: Appointment[],
  tasks: Task[],
): UpcomingItem[] {
  const now = Date.now();
  const horizon = now + 14 * DAY_MS;
  const items: UpcomingItem[] = [];

  for (const appointment of appointments) {
    if (
      appointment.status !== "upcoming" &&
      appointment.status !== "requested"
    ) {
      continue;
    }

    const scheduled = appointment.scheduledAt
      ? Date.parse(appointment.scheduledAt)
      : Number.NaN;
    const inHorizon =
      !Number.isFinite(scheduled) || (scheduled >= now && scheduled <= horizon);

    if (!inHorizon) {
      continue;
    }

    items.push({
      id: `appt-${appointment.id}`,
      kind: "appointment",
      timeLabel: appointment.scheduledAt
        ? `${formatDayLabel(appointment.scheduledAt)} · ${formatTimeLabel(appointment.scheduledAt)}`
        : "Unscheduled",
      sortAt: Number.isFinite(scheduled) ? scheduled : now + DAY_MS * 7,
      title: appointment.title,
      subtitle: appointment.clientName,
      href: `/appointments?client=${appointment.clientId}`,
    });
  }

  for (const task of tasks) {
    if (task.status !== "open" || task.assignee !== "advisor") {
      continue;
    }

    const due = task.dueAt ? Date.parse(task.dueAt) : Number.NaN;
    if (Number.isFinite(due) && due > horizon) {
      continue;
    }

    items.push({
      id: `task-${task.id}`,
      kind: "task",
      timeLabel: task.dueAt
        ? `${formatDayLabel(task.dueAt)} · Task`
        : "No due date",
      sortAt: Number.isFinite(due) ? due : now + DAY_MS * 3,
      title: task.title,
      subtitle: task.clientName ?? "Book task",
      href: task.clientId
        ? `/clients/${task.clientId}?tab=service`
        : "/tasks",
    });
  }

  return items.sort((a, b) => a.sortAt - b.sortAt);
}
