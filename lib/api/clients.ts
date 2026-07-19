import "server-only";

import { executeApi } from "@/lib/api/execute";
import type { Client } from "@/types/client";

export type CreateClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sendInvite?: boolean;
  grantCore?: boolean;
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
  return executeApi<CreateClientResult>("admin.clients.create", {
    method: "POST",
    accessToken,
    body: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      sendInvite: input.sendInvite ?? true,
      grantCore: input.grantCore ?? true,
    },
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
