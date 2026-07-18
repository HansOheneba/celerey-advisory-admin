import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { decrypt, getSessionToken } from "@/lib/session";

export type AdvisorSession = {
  userId: string;
  name: string;
  email: string;
};

export const verifySession = cache(async (): Promise<AdvisorSession | null> => {
  const token = await getSessionToken();
  const payload = await decrypt(token);

  if (!payload?.userId) {
    return null;
  }

  return {
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
  };
});

export async function requireSession() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
