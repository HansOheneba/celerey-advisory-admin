import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session-crypto";

const protectedPrefixes = ["/dashboard", "/clients"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLogin = pathname === "/login";
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  if (isProtected && !session?.userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/login"],
};
