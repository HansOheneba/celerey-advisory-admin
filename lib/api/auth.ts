import "server-only";

import { executeApi } from "@/lib/api/execute";

export type AdvisorProfile = {
  id: string;
  name: string;
  email: string;
  role?: "advisor" | "admin" | string;
};

type VerifyOtpData = {
  session_token: string;
};

type AdvisorMeData = {
  advisor: AdvisorProfile;
};

export async function requestOtp(email: string) {
  return executeApi<{ message?: string }>("auth.request-otp", {
    method: "POST",
    body: {
      email,
      messageType: "OTPAuthMessage:HTML",
      messageSubject: "Your Celerey Login Code",
    },
  });
}

export async function verifyOtp(email: string, otp: string) {
  return executeApi<VerifyOtpData>("auth.verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export async function getAdvisorProfile(accessToken: string) {
  return executeApi<AdvisorMeData>("admin.auth.me", {
    method: "GET",
    accessToken,
  });
}

export async function revokeSession(accessToken: string) {
  return executeApi<{ success?: boolean }>("auth.revoke-session", {
    method: "POST",
    accessToken,
    body: {},
  });
}
