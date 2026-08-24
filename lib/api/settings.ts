import "server-only";

import { executeApi, executeMultipartApi } from "@/lib/api/execute";
import type { Weekday } from "@/lib/settings/options";
import {
  defaultAdvisorSettings,
  type AdvisorNotificationPreferences,
  type AdvisorSettings,
} from "@/lib/settings/local-store";

const WEEKDAYS = new Set<Weekday>([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeDaysAvailable(value: unknown, fallback: Weekday[]): Weekday[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const days = value
    .filter((day): day is string => typeof day === "string")
    .filter((day): day is Weekday => WEEKDAYS.has(day as Weekday));

  return days.length > 0 ? days : fallback;
}

export function mergeAdvisorSettings(
  fallbackName: string,
  profile?: Record<string, unknown> | null,
  notifications?: Record<string, unknown> | null,
  availability?: Record<string, unknown> | null,
): AdvisorSettings {
  const fallback = defaultAdvisorSettings(fallbackName);

  const avatarUrl = asString(
    profile?.avatarUrl ?? profile?.avatar_url ?? profile?.avatarDataUrl,
    "",
  );

  return {
    displayName:
      asString(profile?.displayName ?? profile?.display_name).trim() ||
      fallback.displayName,
    title: asString(profile?.title, fallback.title),
    phone: asString(profile?.phone, fallback.phone),
    bio: asString(profile?.bio, fallback.bio),
    avatarDataUrl: avatarUrl || null,
    country: asString(profile?.country, fallback.country),
    timezone: asString(profile?.timezone, fallback.timezone),
    workingHoursStart: asString(
      availability?.workingHoursStart ?? availability?.working_hours_start,
      fallback.workingHoursStart,
    ),
    workingHoursEnd: asString(
      availability?.workingHoursEnd ?? availability?.working_hours_end,
      fallback.workingHoursEnd,
    ),
    daysAvailable: normalizeDaysAvailable(
      availability?.daysAvailable ?? availability?.days_available,
      fallback.daysAvailable,
    ),
    appointmentDurationMinutes: asNumber(
      availability?.appointmentDurationMinutes ??
        availability?.appointment_duration_minutes,
      fallback.appointmentDurationMinutes,
    ),
    appointmentBufferMinutes: asNumber(
      availability?.appointmentBufferMinutes ??
        availability?.appointment_buffer_minutes,
      fallback.appointmentBufferMinutes,
    ),
    notifications: {
      clientAssigned: asBoolean(
        notifications?.clientAssigned ?? notifications?.client_assigned,
        fallback.notifications.clientAssigned,
      ),
      clientMessage: asBoolean(
        notifications?.clientMessage ?? notifications?.client_message,
        fallback.notifications.clientMessage,
      ),
      appointmentReminder: asBoolean(
        notifications?.appointmentReminder ??
          notifications?.appointment_reminder,
        fallback.notifications.appointmentReminder,
      ),
      taskReminder: asBoolean(
        notifications?.taskReminder ?? notifications?.task_reminder,
        fallback.notifications.taskReminder,
      ),
      documentUploaded: asBoolean(
        notifications?.documentUploaded ?? notifications?.document_uploaded,
        fallback.notifications.documentUploaded,
      ),
      goalUpdate: asBoolean(
        notifications?.goalUpdate ?? notifications?.goal_update,
        fallback.notifications.goalUpdate,
      ),
    },
  };
}

export async function getProfileSettingsApi(accessToken: string) {
  return executeApi<Record<string, unknown>>("admin.settings.profile.get", {
    method: "GET",
    accessToken,
  });
}

export async function updateProfileSettingsApi(
  accessToken: string,
  body: {
    displayName: string;
    title: string;
    phone: string;
    bio: string;
    country: string;
    timezone: string;
  },
) {
  return executeApi<Record<string, unknown>>("admin.settings.profile.update", {
    method: "PUT",
    accessToken,
    body,
  });
}

export async function uploadAvatarApi(accessToken: string, file: Blob) {
  const formData = new FormData();
  formData.append("file", file, file instanceof File ? file.name : "avatar");

  return executeMultipartApi<{ avatarUrl?: string; avatar_url?: string }>(
    "admin.settings.profile.avatar.upload",
    {
      formData,
      accessToken,
    },
  );
}

export async function getNotificationSettingsApi(accessToken: string) {
  return executeApi<Record<string, unknown>>(
    "admin.settings.notifications.get",
    {
      method: "GET",
      accessToken,
    },
  );
}

export async function updateNotificationSettingsApi(
  accessToken: string,
  body: AdvisorNotificationPreferences,
) {
  return executeApi<Record<string, unknown>>(
    "admin.settings.notifications.update",
    {
      method: "PUT",
      accessToken,
      body,
    },
  );
}

export async function getAvailabilitySettingsApi(accessToken: string) {
  return executeApi<Record<string, unknown>>(
    "admin.settings.availability.get",
    {
      method: "GET",
      accessToken,
    },
  );
}

export async function updateAvailabilitySettingsApi(
  accessToken: string,
  body: {
    workingHoursStart: string;
    workingHoursEnd: string;
    daysAvailable: Weekday[];
    appointmentDurationMinutes: number;
    appointmentBufferMinutes: number;
  },
) {
  return executeApi<Record<string, unknown>>(
    "admin.settings.availability.update",
    {
      method: "PUT",
      accessToken,
      body,
    },
  );
}
