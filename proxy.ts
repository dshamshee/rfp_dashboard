import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Admin-only route prefixes (route groups are transparent in the URL)
const adminRoutes = [
  "/",
  "/new-tender",
];

// Public routes that never need auth
const publicRoutes = [
  "/login",
  "/api/auth",
  "/api/auth/signup"
];

function isMatch(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes & static assets through
  if (
    isMatch(pathname, publicRoutes) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    // If authenticated user tries to access /login, redirect to dashboard
    if (pathname === "/login") {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "rfp_dashboard_secret_key_2026",
      });
      if (token) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // Get NextAuth session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "rfp_dashboard_secret_key_2026",
  });

  // ── Unauthenticated → redirect to signin (/login) ─────────────
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string)?.toUpperCase();

  // ── Admin routes: only ADMIN & SUPERADMIN allowed ─────────────
  if (isMatch(pathname, adminRoutes)) {
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;
export { proxy as middleware };

export const config = {
  matcher: [
    /*
     * Match all routes except static files & images.
     * Next.js 16 proxy convention.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
