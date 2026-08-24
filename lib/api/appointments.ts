import "server-only";

import { executeApi } from "@/lib/api/execute";
import type {
  AdvisoryEntitlement,
  Appointment,
  AppointmentSlot,
  AppointmentStatus,
  AppointmentType,
  ProgressSnapshot,
  SessionLog,
  SessionLogInput,
} from "@/lib/appointments/types";

const APPOINTMENT_TYPES = new Set<AppointmentType>([
  "review",
  "annual_review",
  "quarterly_check_in",
  "onboarding",
  "goal_check_in",
  "portfolio_update",
]);

const APPOINTMENT_STATUSES = new Set<AppointmentStatus>([
  "requested",
  "upcoming",
  "completed",
  "cancelled",
]);

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeLog(value: unknown): SessionLog | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const recommendationsRaw = Array.isArray(row.recommendations)
    ? row.recommendations
    : [];

  return {
    title: asString(row.title),
    tags: asStringArray(row.tags),
    advisorAssessment: asString(
      row.advisorAssessment ?? row.advisor_assessment,
    ),
    discussionPoints: asStringArray(
      row.discussionPoints ?? row.discussion_points,
    ),
    recommendations: recommendationsRaw
      .map((item) => {
        if (typeof item === "string") {
          return { title: item };
        }
        if (item && typeof item === "object") {
          return { title: asString((item as { title?: unknown }).title) };
        }
        return { title: "" };
      })
      .filter((item) => item.title),
    sessionNotes: asString(row.sessionNotes ?? row.session_notes),
  };
}

function normalizeProgress(value: unknown): ProgressSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const metricsRaw = Array.isArray(row.metrics) ? row.metrics : [];

  return {
    capturedAt: asString(row.capturedAt ?? row.captured_at),
    metrics: metricsRaw
      .filter((item): item is Record<string, unknown> =>
        Boolean(item && typeof item === "object"),
      )
      .map((item) => ({
        key: asString(item.key),
        label: asString(item.label, asString(item.key)),
        value: asNumber(item.value),
        previous: asNumber(item.previous),
        unit:
          item.unit === "percent" || item.unit === "number"
            ? item.unit
            : "currency",
        currency:
          typeof item.currency === "string" ? item.currency : undefined,
      })),
  };
}

function normalizeAppointment(row: Record<string, unknown>): Appointment {
  const type = asString(row.type);
  const status = asString(row.status);
  const createdBy = asString(row.createdBy ?? row.created_by, "advisor");
  const title = asString(row.title);
  const typeLabel = APPOINTMENT_TYPES.has(type as AppointmentType)
    ? (type as AppointmentType)
    : "review";
  const scheduledAt = asString(row.scheduledAt ?? row.scheduled_at);
  const actionIds = row.actionIds ?? row.action_ids;
  const documentIds = row.documentIds ?? row.document_ids;

  return {
    id: asString(row.id),
    clientId: asString(row.clientId ?? row.client_id),
    clientName: asString(row.clientName ?? row.client_name),
    advisorId: asString(row.advisorId ?? row.advisor_id),
    advisorName: asString(row.advisorName ?? row.advisor_name),
    planYear: asString(row.planYear ?? row.plan_year),
    type: typeLabel,
    title:
      title ||
      (typeLabel === "annual_review"
        ? "Annual Review"
        : typeLabel === "quarterly_check_in"
          ? "Quarterly Check-in"
          : ""),
    scheduledAt: scheduledAt || null,
    durationMinutes: asNumber(row.durationMinutes ?? row.duration_minutes, 30),
    status: APPOINTMENT_STATUSES.has(status as AppointmentStatus)
      ? (status as AppointmentStatus)
      : "upcoming",
    createdBy: createdBy === "client" ? "client" : "advisor",
    log: normalizeLog(row.log),
    progress: normalizeProgress(row.progress),
    actionIds: asStringArray(actionIds),
    documentIds: asStringArray(documentIds),
  };
}

function scheduledTime(value: string | null) {
  return value ? new Date(value).getTime() : Number.POSITIVE_INFINITY;
}

function normalizeSlot(row: Record<string, unknown>): AppointmentSlot {
  return {
    startAt: asString(row.startAt ?? row.start_at),
    endAt: asString(row.endAt ?? row.end_at),
    durationMinutes: asNumber(row.durationMinutes ?? row.duration_minutes, 30),
  };
}

function normalizeEntitlement(row: Record<string, unknown>): AdvisoryEntitlement {
  return {
    planYear: asString(row.planYear ?? row.plan_year),
    included: asNumber(row.included, 0),
    used: asNumber(row.used),
    remaining: asNumber(row.remaining),
  };
}

export async function findAppointmentsApi(
  accessToken: string,
  params: {
    status?: AppointmentStatus | "all";
    clientId?: string;
    from?: string;
    to?: string;
  } = {},
) {
  const result = await executeApi<{
    items?: Array<Record<string, unknown>>;
  }>("admin.appointments.find", {
    method: "GET",
    accessToken,
    searchParams: {
      status: params.status ?? "all",
      clientId: params.clientId,
      from: params.from,
      to: params.to,
    },
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];

  return {
    ok: true as const,
    status: result.status,
    data: {
      items: items
        .map(normalizeAppointment)
        .sort(
          (a, b) =>
            scheduledTime(a.scheduledAt) - scheduledTime(b.scheduledAt),
        ),
    },
  };
}

export async function createAppointmentApi(
  accessToken: string,
  input: {
    clientId: string;
    type: AppointmentType;
    title?: string;
    scheduledAt: string;
    durationMinutes: number;
  },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.appointments.create",
    {
      method: "POST",
      accessToken,
      body: {
        clientId: input.clientId,
        type: input.type,
        title: input.title,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAppointment(result.data),
  };
}

export async function confirmAppointmentApi(
  accessToken: string,
  input: { appointmentId: string; scheduledAt?: string },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.appointments.confirm",
    {
      method: "POST",
      accessToken,
      body: input,
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAppointment(result.data),
  };
}

export async function logAppointmentApi(
  accessToken: string,
  input: SessionLogInput,
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.appointments.log",
    {
      method: "POST",
      accessToken,
      body: input,
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAppointment(result.data),
  };
}

export async function updateAppointmentStatusApi(
  accessToken: string,
  input: {
    appointmentId: string;
    status: "cancelled";
  },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.appointments.update-status",
    {
      method: "PUT",
      accessToken,
      body: {
        appointmentId: input.appointmentId,
        status: input.status,
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAppointment(result.data),
  };
}

export async function findAppointmentSlotsApi(
  accessToken: string,
  params: {
    from: string;
    to: string;
    clientId?: string;
    durationMinutes?: number;
  },
) {
  const result = await executeApi<{
    timezone?: string;
    items?: Array<Record<string, unknown>>;
  }>("admin.appointments.slots.find", {
    method: "GET",
    accessToken,
    searchParams: {
      from: params.from,
      to: params.to,
      clientId: params.clientId,
      durationMinutes: params.durationMinutes,
    },
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];

  return {
    ok: true as const,
    status: result.status,
    data: {
      timezone: asString(result.data.timezone),
      items: items
        .filter((item): item is Record<string, unknown> =>
          Boolean(item && typeof item === "object"),
        )
        .map(normalizeSlot),
    },
  };
}

export async function getAdvisoryEntitlementApi(
  accessToken: string,
  params: { clientId: string; planYear?: string },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.advisory.entitlement.get",
    {
      method: "GET",
      accessToken,
      searchParams: {
        clientId: params.clientId,
        planYear: params.planYear,
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeEntitlement(result.data),
  };
}

export async function updateAdvisoryEntitlementApi(
  accessToken: string,
  input: { clientId: string; planYear: string; included: number },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.advisory.entitlement.update",
    {
      method: "PUT",
      accessToken,
      body: input,
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeEntitlement(result.data),
  };
}
