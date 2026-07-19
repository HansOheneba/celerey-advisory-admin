import "server-only";

import { executeApi } from "@/lib/api/execute";
import type { Client } from "@/types/client";

export type CreateClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  sendInvite?: boolean;
  grantCore?: boolean;
  /** Celerey Core access length in days. Only applied when grantCore is true. */
  durationDays?: number;
};

export type CreateClientResult = {
  client: Client;
  invite?: {
    sent?: boolean;
    inviteId?: string | null;
    expiresAt?: string | null;
    onboardingUrl?: string | null;
  } | null;
};

export type InviteClientResult = {
  inviteId: string | null;
  clientId: string;
  email: string;
  status: "sent" | "already_onboarded" | "queued" | string;
  expiresAt: string | null;
  onboardingUrl: string | null;
};

export async function createClientApi(
  accessToken: string,
  input: CreateClientInput,
) {
  const body = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    sendInvite: input.sendInvite ?? true,
    grantCore: input.grantCore ?? true,
    ...(input.grantCore && input.durationDays
      ? { duration: input.durationDays }
      : {}),
  };

  console.log("[admin.clients.create] payload:", JSON.stringify(body, null, 2));

  return executeApi<CreateClientResult>("admin.clients.create", {
    method: "POST",
    accessToken,
    body,
  });
}

export async function inviteClientApi(
  accessToken: string,
  clientId: string,
  channel: "email" = "email",
) {
  return executeApi<InviteClientResult>("admin.clients.invite", {
    method: "POST",
    accessToken,
    body: {
      client_id: clientId,
      channel,
    },
  });
}
