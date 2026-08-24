"use server";

import { revalidatePath } from "next/cache";
import { updateClientAvailabilityApi } from "@/lib/api/availability";
import type { ClientAvailability } from "@/lib/availability/types";
import { requireSession } from "@/lib/dal";
import { getClientById } from "@/lib/repositories/clients";

export async function updateClientAvailabilityAction(input: {
  clientId: string;
  availability: ClientAvailability;
}): Promise<
  { ok: true; availability: ClientAvailability } | { ok: false; message: string }
> {
  const session = await requireSession();
  const client = await getClientById(input.clientId);

  if (!client || client.advisorId !== session.userId) {
    return {
      ok: false,
      message: "You can only edit availability for clients assigned to you.",
    };
  }

  const result = await updateClientAvailabilityApi(
    session.accessToken,
    input.clientId,
    input.availability,
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath("/appointments");

  return { ok: true, availability: result.data };
}
