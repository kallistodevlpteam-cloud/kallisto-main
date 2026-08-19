import { NextRequest, NextResponse } from "next/server";
import { fetchBackendProjects } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const character = request.nextUrl.searchParams.get("character") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const authHeader = request.headers.get("authorization") ?? undefined;
  const token = authHeader
    ? authHeader.replace(/^Bearer\s+/i, "")
    : request.cookies.get("kallisto_auth_token")?.value;
  const providerId =
    request.headers.get("x-provider-id") ?? request.cookies.get("kallisto_provider_id")?.value;

  try {
    const projects = await fetchBackendProjects(character, status, token || providerId);
    return NextResponse.json({ status: "ok", projects });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: 503 }
    );
  }
}