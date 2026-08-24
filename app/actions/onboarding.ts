"use server";

import { redirect } from "next/navigation";
import { completeAdvisorOnboardingApi } from "@/lib/api/advisors";
import { normalizeRole } from "@/lib/auth/roles";
import {
  AdvisorOnboardingProfileSchema,
  type AdvisorOnboardingFormState,
} from "@/lib/definitions";
import { createSession } from "@/lib/session";

export async function completeAdvisorOnboardingAction(
  _state: AdvisorOnboardingFormState,
  formData: FormData,
): Promise<AdvisorOnboardingFormState> {
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    return { message: "This invite link is missing a token." };
  }

  const validatedFields = AdvisorOnboardingProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    bio: formData.get("bio") ?? "",
    country: formData.get("country"),
    timezone: formData.get("timezone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { displayName, title, phone, bio, country, timezone } =
    validatedFields.data;

  const result = await completeAdvisorOnboardingApi({
    token,
    displayName,
    title,
    phone,
    bio: bio ?? "",
    country,
    timezone,
  });

  if (!result.ok) {
    return { message: result.message };
  }

  const advisor = result.data.advisor;
  const accessToken = result.data.session_token;

  if (!advisor?.id || !accessToken) {
    return {
      message: "Account was created but sign-in details were missing.",
    };
  }

  await createSession({
    userId: advisor.id,
    name: advisor.name || displayName,
    email: advisor.email || "",
    accessToken,
    role: normalizeRole(advisor.role),
  });

  redirect("/dashboard");
}
