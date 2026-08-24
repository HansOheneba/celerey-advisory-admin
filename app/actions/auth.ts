"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAdvisorProfile,
  requestOtp as requestOtpApi,
  revokeSession,
  switchSessionRole,
  verifyOtp as verifyOtpApi,
} from "@/lib/api/auth";
import {
  EmailFormSchema,
  OtpFormSchema,
  type LoginFormState,
  type RequestOtpFormState,
} from "@/lib/definitions";
import {
  actingRoleForLogin,
  contextFromRole,
  effectiveRole,
  parseSessionRoleContext,
  sessionRoleFields,
  withActingRole,
  type StaffRole,
} from "@/lib/auth/roles";
import { createSession, deleteSession, getSessionToken, decrypt } from "@/lib/session";
import { requireSession } from "@/lib/dal";

export async function requestOtp(
  _state: RequestOtpFormState,
  formData: FormData,
): Promise<RequestOtpFormState> {
  const validatedFields = EmailFormSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { email, role } = validatedFields.data;
  const result = await requestOtpApi(email, role);

  if (!result.ok) {
    return {
      message: result.message || "Unable to send verification code.",
    };
  }

  return { success: true, email, role };
}

export async function verifyOtp(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = OtpFormSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { email, otp, role } = validatedFields.data;
  const verifyResult = await verifyOtpApi(email, otp, role);

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
      role?: string;
    };
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };

  const advisor = profileData.advisor ?? profileData;

  if (!advisor?.id) {
    return {
      message: "Advisor profile was missing from the API response.",
    };
  }

  let context = contextFromRole(
    role === "super_admin" ? "super_admin" : advisor.role,
  );
  const intendedActingRole = actingRoleForLogin(role);
  const needsSwitch =
    intendedActingRole !== null && effectiveRole(context) !== intendedActingRole;

  if (needsSwitch) {
    const switchResult = await switchSessionRole(
      accessToken,
      intendedActingRole,
    );

    if (switchResult.ok) {
      context = withActingRole(
        parseSessionRoleContext(switchResult.data, advisor.role),
        intendedActingRole,
      );
    } else {
      context = withActingRole(context, intendedActingRole);
    }
  } else {
    context = withActingRole(context, intendedActingRole);
  }

  await createSession({
    userId: advisor.id,
    name: advisor.name || email.split("@")[0] || "Advisor",
    email: advisor.email || email.toLowerCase(),
    accessToken,
    ...sessionRoleFields(context),
  });

  const next = safeInternalPath(formData.get("next"));
  redirect(next ?? "/dashboard");
}

function safeInternalPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const path = value.trim();
  if (path === "/onboarding" || path.startsWith("/onboarding?")) {
    return "/onboarding";
  }

  return null;
}

export async function switchActingRoleAction(role: StaffRole) {
  const session = await requireSession();
  const actingRole = actingRoleForLogin(role);
  const result = await switchSessionRole(session.accessToken, actingRole);

  if (!result.ok) {
    return { ok: false as const, message: result.message };
  }

  const context = withActingRole(
    {
      trueRoles: session.trueRoles,
      availableRoles: session.availableRoles,
      isSuperAdmin: session.isSuperAdmin,
      activeRole: session.activeRole,
      scope: session.scope,
    },
    actingRole,
  );

  await createSession({
    userId: session.userId,
    name: session.name,
    email: session.email,
    accessToken: session.accessToken,
    ...sessionRoleFields(context),
  });

  revalidatePath("/", "layout");
  return { ok: true as const };
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
