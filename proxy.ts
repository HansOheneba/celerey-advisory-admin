import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session-crypto";

const protectedPrefixes = [
  "/dashboard",
  "/clients",
  "/copilot",
  "/insights",
  "/products",
  "/tools",
  "/advisors",
  "/assignments",
  "/appointments",
  "/messages",
  "/tasks",
  "/reports",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLogin = pathname === "/login" || pathname === "/super";
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  const isAuthenticated = Boolean(session?.userId && session.accessToken);

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/copilot/:path*",
    "/insights/:path*",
    "/products/:path*",
    "/tools/:path*",
    "/advisors/:path*",
    "/assignments/:path*",
    "/appointments/:path*",
    "/messages/:path*",
    "/tasks/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
    "/super",
  ],
};
