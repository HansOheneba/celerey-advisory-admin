import "server-only";

import { cookies } from "next/headers";
import { decrypt, encrypt, SESSION_COOKIE } from "@/lib/session-crypto";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(user: {
  userId: string;
  name: string;
  email: string;
}) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({
    userId: user.userId,
    name: user.name,
    email: user.email,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export { decrypt, SESSION_COOKIE };
