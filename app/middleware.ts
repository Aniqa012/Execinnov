import { NextResponse } from "next/server";
import { auth } from "./auth";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/signin",
  "/signup",
  "/api/auth/signin",
  "/api/auth/signup", 
  "/api/auth/signout",
  "/api/auth/callback",
  "/api/auth/csrf",
  "/api/auth/providers",
  "/api/auth/session",
  "/unauthorized",
  "/about",
  "/contact",
];

// Helper function to check if a route is public
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  ) || pathname.startsWith("/api/auth");
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAdmin = req.auth?.user?.isAdmin;
  const isPublic = isPublicRoute(nextUrl.pathname);

  // Allow access to public routes
  if (isPublic) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute) {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      const loginUrl = new URL("/signin", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If logged in but not admin, redirect to unauthorized page
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/signin", nextUrl));
    }

    // Admin user accessing admin route - allow access
    return NextResponse.next();
  }

  // For all other protected routes (non-admin, non-public)
  if (!isLoggedIn) {
    const loginUrl = new URL("/signin", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in user accessing protected route - allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes, except auth routes which are handled above)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public assets
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};