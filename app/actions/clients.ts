"use server";

import { revalidatePath } from "next/cache";
import { createClientApi } from "@/lib/api/clients";
import { isAdmin } from "@/lib/auth/roles";
import {
  AssignAdvisorSchema,
  CreateClientFormSchema,
  DEFAULT_CORE_DURATION_DAYS,
  UpdateSubscriptionSchema,
  type AssignAdvisorFormState,
  type CreateClientFormState,
  type UpdateSubscriptionFormState,
} from "@/lib/definitions";
import { requireAdmin, requireSession } from "@/lib/dal";
import {
  assignClientAdvisor,
  updateClientSubscription,
} from "@/lib/repositories/clients";

function formFlag(formData: FormData, key: string) {
  return formData.get(key) === "true" || formData.get(key) === "on";
}

export async function createClientAction(
  _state: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const session = await requireSession();
  const admin = isAdmin(session.role);

  const grantCore = admin ? formFlag(formData, "grantCore") : false;
  const rawAdvisorId = String(formData.get("advisorId") ?? "").trim();

  const validatedFields = CreateClientFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    grantCore,
    durationDays: formData.get("duration") ?? DEFAULT_CORE_DURATION_DAYS,
    advisorId: rawAdvisorId || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { firstName, lastName, email, durationDays, advisorId } =
    validatedFields.data;

  const assignedAdvisorId = admin
    ? advisorId || undefined
    : session.userId;

  const result = await createClientApi(session.accessToken, {
    firstName,
    lastName,
    email,
    sendInvite: true,
    grantCore,
    durationDays: grantCore ? durationDays : undefined,
    advisorId: assignedAdvisorId,
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
  revalidatePath("/advisors");

  return { success: true };
}

export async function updateClientSubscriptionAction(
  _state: UpdateSubscriptionFormState,
  formData: FormData,
): Promise<UpdateSubscriptionFormState> {
  await requireAdmin();

  const validatedFields = UpdateSubscriptionSchema.safeParse({
    clientId: formData.get("clientId"),
    subscription: formData.get("subscription"),
    durationDays: formData.get("duration") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { clientId, subscription, durationDays } = validatedFields.data;
  const result = await updateClientSubscription(
    clientId,
    subscription,
    durationDays,
  );

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function assignClientAdvisorAction(
  _state: AssignAdvisorFormState,
  formData: FormData,
): Promise<AssignAdvisorFormState> {
  await requireAdmin();

  const rawAdvisorId = String(formData.get("advisorId") ?? "").trim();
  const validatedFields = AssignAdvisorSchema.safeParse({
    clientId: formData.get("clientId"),
    advisorId: rawAdvisorId === "" || rawAdvisorId === "unassigned"
      ? null
      : rawAdvisorId,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Choose a valid advisor.",
    };
  }

  const { clientId, advisorId } = validatedFields.data;
  const result = await assignClientAdvisor(clientId, advisorId);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/advisors");
  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return { success: true };
}
