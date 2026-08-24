import "server-only";

import { executeApi } from "@/lib/api/execute";
import {
  DEFAULT_CLIENT_AVAILABILITY,
  type ClientAvailability,
} from "@/lib/availability/types";
import type { Weekday } from "@/lib/settings/options";

const WEEKDAYS = new Set<Weekday>([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

function normalizeAvailability(row: Record<string, unknown> | null): ClientAvailability {
  const daysRaw = row?.daysAvailable ?? row?.days_available;
  const days = Array.isArray(daysRaw)
    ? daysRaw.filter((day): day is Weekday => WEEKDAYS.has(day as Weekday))
    : DEFAULT_CLIENT_AVAILABILITY.daysAvailable;

  return {
    timezone: asString(
      row?.timezone,
      DEFAULT_CLIENT_AVAILABILITY.timezone,
    ),
    hoursStart: asString(
      row?.hoursStart ?? row?.hours_start,
      DEFAULT_CLIENT_AVAILABILITY.hoursStart,
    ),
    hoursEnd: asString(
      row?.hoursEnd ?? row?.hours_end,
      DEFAULT_CLIENT_AVAILABILITY.hoursEnd,
    ),
    daysAvailable: days.length > 0 ? days : DEFAULT_CLIENT_AVAILABILITY.daysAvailable,
  };
}

export async function getClientAvailabilityApi(
  accessToken: string,
  clientId: string,
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.clients.availability.get",
    {
      method: "GET",
      accessToken,
      searchParams: { clientId },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAvailability(result.data),
  };
}

export async function updateClientAvailabilityApi(
  accessToken: string,
  clientId: string,
  availability: ClientAvailability,
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.clients.availability.update",
    {
      method: "PUT",
      accessToken,
      body: {
        clientId,
        ...availability,
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeAvailability(result.data),
  };
}
