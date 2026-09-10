import "server-only";

import { executeApi } from "@/lib/api/execute";
import type {
  AdvisoryEntitlement,
  Appointment,
  AppointmentSlot,
  AppointmentStatus,
  AppointmentType,
  MeetingActionItem,
  MeetingAiNotes,
  MeetingProvider,
  NotesVisibility,
  ProgressSnapshot,
  SessionLog,
  SessionLogInput,
  TranscriptStatus,
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
  "proposed",
  "counter_proposed",
  "accepted",
  "declined",
  "upcoming",
  "scheduled",
  "in_progress",
  "processing_notes",
  "pending_review",
  "published",
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

function normalizeStatus(value: string): AppointmentStatus {
  if (value === "confirmed") {
    return "upcoming";
  }

  return APPOINTMENT_STATUSES.has(value as AppointmentStatus)
    ? (value as AppointmentStatus)
    : "upcoming";
}

function normalizeMeetingAiNotes(value: unknown): MeetingAiNotes | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const actionItemsValue = row.actionItems ?? row.action_items;
  const actionItemsRaw = Array.isArray(actionItemsValue)
    ? actionItemsValue
    : [];

  return {
    summary: asString(row.summary),
    discussionPoints: asStringArray(row.discussionPoints ?? row.discussion_points),
    actionItems: actionItemsRaw
      .filter((item): item is Record<string, unknown> =>
        Boolean(item && typeof item === "object"),
      )
      .map((item) => ({
        title: asString(item.title),
        owner: asString(item.owner),
        dueAt: asString(item.dueAt ?? item.due_at) || null,
      })),
    participants: asStringArray(row.participants),
    transcriptExcerpt: asString(
      row.transcriptExcerpt ?? row.transcript_excerpt,
    ),
    fullTranscript: asString(row.fullTranscript ?? row.full_transcript),
  };
}

function normalizeMeetingProvider(value: unknown): MeetingProvider | null {
  if (value === "google_meet" || value === "teams" || value === "zoom") {
    return value;
  }
  return null;
}

function normalizeNotesVisibility(value: unknown): NotesVisibility {
  if (value === "draft" || value === "published") {
    return value;
  }
  return "none";
}

function normalizeTranscriptStatus(value: unknown): TranscriptStatus {
  if (
    value === "pending" ||
    value === "processing" ||
    value === "ready" ||
    value === "failed"
  ) {
    return value;
  }
  return "pending";
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
    status: normalizeStatus(status),
    createdBy: createdBy === "client" ? "client" : "advisor",
    proposedBy:
      row.proposedBy === "client" || row.proposed_by === "client"
        ? "client"
        : row.proposedBy === "advisor" || row.proposed_by === "advisor"
          ? "advisor"
          : undefined,
    proposedSlots: (() => {
      const slotsValue = row.proposedSlots ?? row.proposed_slots;
      if (!Array.isArray(slotsValue)) {
        return undefined;
      }
      return slotsValue
        .filter((item): item is Record<string, unknown> =>
          Boolean(item && typeof item === "object"),
        )
        .map(normalizeSlot);
    })(),
    meetingProvider: normalizeMeetingProvider(
      row.meetingProvider ?? row.meeting_provider,
    ),
    meetingUrl: asString(row.meetingUrl ?? row.meeting_url) || null,
    calendarSynced: Boolean(row.calendarSynced ?? row.calendar_synced),
    transcriptStatus: normalizeTranscriptStatus(
      row.transcriptStatus ?? row.transcript_status,
    ),
    notesVisibility: normalizeNotesVisibility(
      row.notesVisibility ?? row.notes_visibility,
    ),
    aiNotesDraft: normalizeMeetingAiNotes(
      row.aiNotesDraft ?? row.ai_notes_draft,
    ),
    aiNotesPublished: normalizeMeetingAiNotes(
      row.aiNotesPublished ?? row.ai_notes_published,
    ),
    publishedAt: asString(row.publishedAt ?? row.published_at) || null,
    publishedByAdvisorId:
      asString(row.publishedByAdvisorId ?? row.published_by_advisor_id) ||
      null,
    reviewedAt: asString(row.reviewedAt ?? row.reviewed_at) || null,
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

export async function publishAppointmentNotesApi(
  accessToken: string,
  input: {
    appointmentId: string;
    summary: string;
    discussionPoints: string[];
    actionItems: MeetingActionItem[];
  },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.appointments.publish-notes",
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
    status: AppointmentStatus;
    scheduledAt?: string;
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
        scheduledAt: input.scheduledAt,
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
