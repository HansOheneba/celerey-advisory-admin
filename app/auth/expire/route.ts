import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-crypto";

/**
 * Clears the app session cookie, then sends the user to login.
 * Used when an authenticated API call fails with an expired/invalid token —
 * cookie mutation is only allowed from a Route Handler (not RSC renders).
 */
export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("reason", "session_expired");

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);

  return response;
}
