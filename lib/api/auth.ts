import "server-only";

import { APPLICATION_NAME } from "@/lib/brand";
import { executeApi } from "@/lib/api/execute";
import {
  parseSessionRoleContext,
  type ActingRole,
  type SessionRoleContext,
  type StaffRole,
} from "@/lib/auth/roles";

export type AdvisorProfile = {
  id: string;
  name: string;
  email: string;
  role?: StaffRole | string;
};

type VerifyOtpData = {
  session_token: string;
};

type AdvisorMeData = {
  advisor: AdvisorProfile;
};

export async function requestOtp(email: string, role: StaffRole) {
  return executeApi<{ message?: string }>("auth.request-otp", {
    method: "POST",
    body: {
      email,
      role,
      messageType: "OTPAuthMessage:HTML",
      messageSubject: `Your ${APPLICATION_NAME} login code`,
    },
  });
}

export async function verifyOtp(
  email: string,
  otp: string,
  role: StaffRole,
) {
  return executeApi<VerifyOtpData>("auth.verify-otp", {
    method: "POST",
    body: { email, otp, role },
  });
}

export async function getAdvisorProfile(accessToken: string) {
  return executeApi<AdvisorMeData>("admin.auth.me", {
    method: "GET",
    accessToken,
    // Login probes a brand-new token; keep the form error instead of bouncing.
    redirectOnUnauthorized: false,
  });
}

export async function getActiveRole(
  accessToken: string,
  options?: { redirectOnUnauthorized?: boolean },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.session.active-role",
    {
      method: "GET",
      accessToken,
      redirectOnUnauthorized: options?.redirectOnUnauthorized,
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ...result,
    data: parseSessionRoleContext(result.data),
  };
}

export async function switchSessionRole(
  accessToken: string,
  role: ActingRole | null,
) {
  return executeApi<SessionRoleContext | Record<string, unknown>>(
    "admin.session.switch-role",
    {
      method: "PUT",
      accessToken,
      body: { role },
    },
  );
}

export async function revokeSession(accessToken: string) {
  return executeApi<{ success?: boolean }>("auth.revoke-session", {
    method: "POST",
    accessToken,
    body: {},
    // Logout already clears the cookie; don't redirect mid-cleanup.
    redirectOnUnauthorized: false,
  });
}
