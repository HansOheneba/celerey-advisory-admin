"use server";

import { redirect } from "next/navigation";
import {
  getAdvisorProfile,
  requestOtp as requestOtpApi,
  revokeSession,
  verifyOtp as verifyOtpApi,
} from "@/lib/api/auth";
import {
  EmailFormSchema,
  OtpFormSchema,
  type LoginFormState,
  type RequestOtpFormState,
} from "@/lib/definitions";
import { createSession, deleteSession, getSessionToken, decrypt } from "@/lib/session";

export async function requestOtp(
  _state: RequestOtpFormState,
  formData: FormData,
): Promise<RequestOtpFormState> {
  const validatedFields = EmailFormSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { email } = validatedFields.data;
  const result = await requestOtpApi(email);

  if (!result.ok) {
    return {
      message: result.message || "Unable to send verification code.",
    };
  }

  return { success: true, email };
}

export async function verifyOtp(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = OtpFormSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { email, otp } = validatedFields.data;
  const verifyResult = await verifyOtpApi(email, otp);

  if (!verifyResult.ok) {
    return {
      errors: { otp: [verifyResult.message] },
      message: verifyResult.message || "Invalid verification code.",
    };
  }

  const accessToken = verifyResult.data.session_token;

  if (!accessToken) {
    return {
      message: "Login succeeded but no session token was returned.",
    };
  }

  const profileResult = await getAdvisorProfile(accessToken);

  if (!profileResult.ok) {
    return {
      message:
        profileResult.status === 403 || profileResult.status === 401
          ? "This account does not have advisor access."
          : profileResult.message || "Unable to load advisor profile.",
    };
  }

  const profileData = profileResult.data as {
    advisor?: {
      id?: string;
      name?: string;
      email?: string;
    };
    id?: string;
    name?: string;
    email?: string;
  };

  const advisor = profileData.advisor ?? profileData;

  if (!advisor?.id) {
    return {
      message: "Advisor profile was missing from the API response.",
    };
  }

  await createSession({
    userId: advisor.id,
    name: advisor.name || email.split("@")[0] || "Advisor",
    email: advisor.email || email.toLowerCase(),
    accessToken,
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieToken = await getSessionToken();
  const payload = await decrypt(cookieToken);

  if (payload?.accessToken) {
    await revokeSession(payload.accessToken);
  }

  await deleteSession();
  redirect("/login");
}
