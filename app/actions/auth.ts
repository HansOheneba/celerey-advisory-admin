"use server";

import { redirect } from "next/navigation";
import { OtpFormSchema, type LoginFormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

function advisorNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "advisor";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

  const { email } = validatedFields.data;
  const demoName = process.env.DEMO_ADVISOR_NAME ?? advisorNameFromEmail(email);

  // Foundation OTP: accept any 6-digit code for any email.
  await createSession({
    userId: `advisor-${email.toLowerCase()}`,
    name: demoName,
    email: email.toLowerCase(),
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
