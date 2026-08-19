import { NextRequest, NextResponse } from "next/server";
import { fetchBackendProjects } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuthTokenFromCookie(request: NextRequest): string | undefined {
  const cookie = request.cookies.get("kallisto_auth_token");
  return cookie?.value ? `Bearer ${cookie.value}` : undefined;
}

export async function GET(request: NextRequest) {
  const character = request.nextUrl.searchParams.get("character") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const authHeader = request.headers.get("authorization")
    ?? getAuthTokenFromCookie(request);
  try {
    const projects = await fetchBackendProjects(character, status, authHeader);
    return NextResponse.json({ status: "ok", projects });
  } catch (error) {
    const statusCode = error instanceof Error && "status" in error ? (error as any).status : 503;
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: statusCode }
    );
  }
}