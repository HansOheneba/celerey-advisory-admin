"use server";

import { revalidatePath } from "next/cache";
import { createClientApi } from "@/lib/api/clients";
import {
  CreateClientFormSchema,
  DEFAULT_CORE_DURATION_DAYS,
  UpdateSubscriptionSchema,
  type CreateClientFormState,
  type UpdateSubscriptionFormState,
} from "@/lib/definitions";
import { requireSession } from "@/lib/dal";
import { updateClientSubscription } from "@/lib/repositories/clients";

function formFlag(formData: FormData, key: string) {
  return formData.get(key) === "true" || formData.get(key) === "on";
}

export async function createClientAction(
  _state: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const session = await requireSession();

  const validatedFields = CreateClientFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    grantCore: formFlag(formData, "grantCore"),
    durationDays: formData.get("duration") ?? DEFAULT_CORE_DURATION_DAYS,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { firstName, lastName, email, grantCore, durationDays } =
    validatedFields.data;

  const result = await createClientApi(session.accessToken, {
    firstName,
    lastName,
    email,
    sendInvite: true,
    grantCore,
    durationDays: grantCore ? durationDays : undefined,
  });

  if (!result.ok) {
    const emailError =
      result.status === 409
        ? "A client with this email already exists."
        : result.message;

    return {
      errors: { email: [emailError] },
      message: result.message,
    };
  }

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateClientSubscriptionAction(
  _state: UpdateSubscriptionFormState,
  formData: FormData,
): Promise<UpdateSubscriptionFormState> {
  await requireSession();

  const validatedFields = UpdateSubscriptionSchema.safeParse({
    clientId: formData.get("clientId"),
    subscription: formData.get("subscription"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Choose a valid subscription.",
    };
  }

  const { clientId, subscription } = validatedFields.data;
  const result = await updateClientSubscription(clientId, subscription);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");

  return { success: true };
}
