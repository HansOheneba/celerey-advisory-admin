"use server";

import { revalidatePath } from "next/cache";
import {
  confirmAppointmentApi,
  createAppointmentApi,
  findAppointmentSlotsApi,
  findAppointmentsApi,
  getAdvisoryEntitlementApi,
  logAppointmentApi,
  updateAdvisoryEntitlementApi,
  updateAppointmentStatusApi,
} from "@/lib/api/appointments";
import { requireSession } from "@/lib/dal";
import { getClientById } from "@/lib/repositories/clients";
import type {
  AdvisoryEntitlement,
  Appointment,
  AppointmentSlot,
  AppointmentStatus,
  AppointmentType,
  SessionLogInput,
} from "@/lib/appointments/types";

function revalidateAppointmentPaths(clientId?: string) {
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  if (clientId) {
    revalidatePath(`/clients/${clientId}`);
  }
}

export async function listAppointmentsAction(
  status: AppointmentStatus | "all" = "all",
): Promise<{ ok: true; items: Appointment[] } | { ok: false; message: string }> {
  const session = await requireSession();
  const result = await findAppointmentsApi(session.accessToken, { status });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, items: result.data.items };
}

export async function createAppointmentAction(input: {
  clientId: string;
  type: AppointmentType;
  title?: string;
  scheduledAt: string;
  durationMinutes: number;
}): Promise<
  { ok: true; appointment: Appointment } | { ok: false; message: string }
> {
  const session = await requireSession();
  const client = await getClientById(input.clientId);

  if (!client || client.advisorId !== session.userId) {
    return {
      ok: false,
      message: "You can only schedule appointments with clients assigned to you.",
    };
  }

  const result = await createAppointmentApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidateAppointmentPaths(input.clientId);

  return { ok: true, appointment: result.data };
}

export async function confirmAppointmentAction(input: {
  appointmentId: string;
  scheduledAt?: string;
}): Promise<
  { ok: true; appointment: Appointment } | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await confirmAppointmentApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidateAppointmentPaths(result.data.clientId);

  return { ok: true, appointment: result.data };
}

export async function logAppointmentAction(
  input: SessionLogInput,
): Promise<
  { ok: true; appointment: Appointment } | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await logAppointmentApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidateAppointmentPaths(result.data.clientId);

  return { ok: true, appointment: result.data };
}

export async function updateAppointmentStatusAction(input: {
  appointmentId: string;
  status: "cancelled";
}): Promise<
  { ok: true; appointment: Appointment } | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await updateAppointmentStatusApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidateAppointmentPaths(result.data.clientId);

  return { ok: true, appointment: result.data };
}

export async function findAppointmentSlotsAction(input: {
  from: string;
  to: string;
  clientId?: string;
  durationMinutes?: number;
}): Promise<
  | { ok: true; items: AppointmentSlot[]; timezone: string }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await findAppointmentSlotsApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return {
    ok: true,
    items: result.data.items,
    timezone: result.data.timezone,
  };
}

export async function getAdvisoryEntitlementAction(
  clientId: string,
): Promise<
  | { ok: true; entitlement: AdvisoryEntitlement }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await getAdvisoryEntitlementApi(session.accessToken, {
    clientId,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, entitlement: result.data };
}

export async function updateAdvisoryEntitlementAction(input: {
  clientId: string;
  planYear: string;
  included: number;
}): Promise<
  | { ok: true; entitlement: AdvisoryEntitlement }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const client = await getClientById(input.clientId);

  if (!client || client.advisorId !== session.userId) {
    return {
      ok: false,
      message: "You can only update entitlement for clients assigned to you.",
    };
  }

  const result = await updateAdvisoryEntitlementApi(
    session.accessToken,
    input,
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidateAppointmentPaths(input.clientId);

  return { ok: true, entitlement: result.data };
}
