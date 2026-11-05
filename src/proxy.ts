import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/my-books",
  "/my-borrows",
  "/add-book",
  "/admin",
  "/profile",
];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Retrieve Better Auth session token (handles standard & HTTPS secure cookies)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthenticated = Boolean(sessionToken);

  // /books/:id is a private route, but the /books catalog itself is public
  const isBookDetail = /^\/books\/[^/]+$/.test(pathname);
  const isProtectedRoute =
    isBookDetail || protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If visiting protected route without active session
  if (isProtectedRoute && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname + search);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user attempts to visit /login or /register
  if (isAuthRoute && isAuthenticated) {
    const callbackUrlParam = request.nextUrl.searchParams.get("callbackUrl");

    // Only follow safe, root-relative callback URLs. Never bounce back to an
    // auth page (or the page we are already on) - doing so redirects to the
    // same URL forever, which is what makes the browser spin on "too many
    // redirects" after signing up/in.
    let target = "/";
    if (
      callbackUrlParam &&
      callbackUrlParam.startsWith("/") &&
      !callbackUrlParam.startsWith("//") &&
      !callbackUrlParam.includes("\\")
    ) {
      const callbackPath = new URL(callbackUrlParam, request.url).pathname;
      const callbackIsAuthRoute = authRoutes.some(
        (route) => callbackPath === route || callbackPath.startsWith(`${route}/`)
      );

      if (!callbackIsAuthRoute && callbackPath !== pathname) {
        target = callbackUrlParam;
      }
    }
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my-books/:path*",
    "/my-borrows/:path*",
    "/add-book/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/books/:path+",
    "/login",
    "/register",
  ],
};
