import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/lib/definitions";

export const SESSION_COOKIE = "celerey_session";

function getEncodedKey() {
  const secretKey = process.env.SESSION_SECRET;

  if (!secretKey) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return new TextEncoder().encode(secretKey);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = "") {
  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
