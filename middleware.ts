import { NextResponse, type NextRequest } from "next/server";

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/sign-in",
  "/client/login",
  "/client/sign-in",
  "/partner/login",
  "/partner/sign-in",
  "/apply",
  "/waitlist",
  "/api/auth",
  "/api/health",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next.js internal bundles, and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".") || // files like favicon.ico, images, fonts
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );

  // Check auth session in cookies or Authorization header: require a valid auth token
  const authHeader = request.headers.get("authorization");
  const authToken =
    request.cookies.get("kallisto_auth_token")?.value ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  const isAuthenticated = Boolean(authToken && authToken.trim().length > 0);

  // Allow all /api/ routes to be handled by their respective route handlers
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // If user is unauthenticated and attempting to access a protected route
  if (!isAuthenticated && !isPublicPath) {
    let loginTarget = "/login";
    if (pathname.startsWith("/client")) {
      loginTarget = "/client/login";
    } else if (pathname.startsWith("/partner")) {
      loginTarget = "/partner/login";
    }
    const loginUrl = new URL(loginTarget, request.url);
    if (pathname !== "/" && pathname !== "/client" && pathname !== "/partner") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authenticated and visits partner login/sign-in, redirect to partner workspace
  if (isAuthenticated && (pathname === "/partner/login" || pathname === "/partner/sign-in")) {
    const partnerType = (request.cookies.get("kallisto_partner_type")?.value || "HANDS").toLowerCase();
    const partnerTarget = partnerType === "hub" ? "/partner/hub" : partnerType === "basics" ? "/partner/basics" : "/partner/hands";
    return NextResponse.redirect(new URL(partnerTarget, request.url));
  }

  // If user is already authenticated and visits client login/sign-in, redirect to client overview
  if (isAuthenticated && (pathname === "/client/login" || pathname === "/client/sign-in")) {
    return NextResponse.redirect(new URL("/client/overview", request.url));
  }

  // If user is already authenticated and visits login/sign-in, redirect to provider home workspace
  if (isAuthenticated && (pathname === "/login" || pathname === "/sign-in")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
