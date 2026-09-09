"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClientApi, type ClientIdentityInput } from "@/lib/api/clients";
import { isAdmin } from "@/lib/auth/roles";
import {
  AssignAdvisorSchema,
  CreateClientFormSchema,
  CreateClientModeSchema,
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

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

function parseCreateClientPayload(formData: FormData) {
  const creationModeResult = CreateClientModeSchema.safeParse(
    String(formData.get("creationMode") ?? "invite"),
  );

  if (!creationModeResult.success) {
    return creationModeResult;
  }

  const creationMode = creationModeResult.data;

  const grantCore = formFlag(formData, "grantCore");
  const rawAdvisorId = String(formData.get("advisorId") ?? "").trim();
  const shared = {
    grantCore,
    durationDays: formData.get("duration") ?? DEFAULT_CORE_DURATION_DAYS,
    advisorId: rawAdvisorId || undefined,
  };

  if (creationMode === "invite") {
    return CreateClientFormSchema.safeParse({
      creationMode,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      ...shared,
    });
  }

  return CreateClientFormSchema.safeParse({
    creationMode,
    accountMode: formData.get("accountMode"),
    firstName: optionalString(formData, "firstName"),
    lastName: optionalString(formData, "lastName"),
    displayName: optionalString(formData, "displayName"),
    dateOfBirth: optionalString(formData, "dateOfBirth"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    residentCountry: formData.get("residentCountry"),
    residentState: optionalString(formData, "residentState"),
    residentCity: formData.get("residentCity"),
    currency: formData.get("currency"),
    prefix: optionalString(formData, "prefix"),
    gender: optionalString(formData, "gender"),
    maritalStatus: optionalString(formData, "maritalStatus"),
    occupation: optionalString(formData, "occupation"),
    ...shared,
  });
}

function buildIdentityPayload(
  data: Extract<z.infer<typeof CreateClientFormSchema>, { creationMode: "direct" }>,
): ClientIdentityInput {
  const isSolo = data.accountMode === "solo";
  const firstName = data.firstName?.trim() ?? "";
  const lastName = data.lastName?.trim() ?? "";

  return {
    account_mode: data.accountMode,
    phone_number: data.phoneNumber,
    resident_country: data.residentCountry,
    resident_city: data.residentCity,
    currency: data.currency,
    display_name: isSolo
      ? `${firstName} ${lastName}`.trim()
      : (data.displayName?.trim() ?? ""),
    first_name: isSolo ? firstName : null,
    last_name: isSolo ? lastName : null,
    date_of_birth: isSolo ? (data.dateOfBirth ?? null) : null,
    resident_state: data.residentState ?? null,
    prefix: data.prefix ?? null,
    gender: data.gender ?? null,
    marital_status: data.maritalStatus ?? null,
    occupation: data.occupation ?? null,
  };
}

export async function createClientAction(
  _state: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const session = await requireSession();
  const admin = isAdmin(session.role);

  const parsed = parseCreateClientPayload(formData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten()
        .fieldErrors as NonNullable<CreateClientFormState>["errors"],
      message: "Please fix the errors below.",
      creationMode: CreateClientModeSchema.safeParse(
        formData.get("creationMode"),
      ).data,
    };
  }

  const validatedFields = parsed.data;

  const { email, grantCore, durationDays, advisorId, creationMode } =
    validatedFields;

  const assignedAdvisorId = admin
    ? advisorId || undefined
    : session.userId;

  const firstName =
    creationMode === "invite"
      ? validatedFields.firstName
      : validatedFields.accountMode === "solo"
        ? (validatedFields.firstName ?? "")
        : (validatedFields.displayName?.split(" ")[0] ?? "Client");

  const lastName =
    creationMode === "invite"
      ? validatedFields.lastName
      : validatedFields.accountMode === "solo"
        ? (validatedFields.lastName ?? "")
        : (validatedFields.displayName?.split(" ").slice(1).join(" ") ||
            validatedFields.displayName ||
            "Household");

  const result = await createClientApi(session.accessToken, {
    firstName,
    lastName,
    email,
    creationMode,
    sendInvite: creationMode === "invite",
    grantCore,
    durationDays: grantCore ? durationDays : undefined,
    advisorId: assignedAdvisorId,
    identity:
      creationMode === "direct"
        ? buildIdentityPayload(validatedFields)
        : undefined,
  });

  if (!result.ok) {
    const emailError =
      result.status === 409
        ? "A client with this email already exists."
        : result.message;

    return {
      errors: { email: [emailError] },
      message: result.message,
      creationMode,
    };
  }

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  revalidatePath("/advisors");

  return { success: true, creationMode };
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
