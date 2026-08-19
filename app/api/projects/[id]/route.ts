import { NextRequest, NextResponse } from "next/server";
import { fetchBackendProjectById, BackendError } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization") ?? undefined;
  const token = authHeader
    ? authHeader.replace(/^Bearer\s+/i, "")
    : request.cookies.get("kallisto_auth_token")?.value;
  const providerId =
    request.headers.get("x-provider-id") ?? request.cookies.get("kallisto_provider_id")?.value;

  try {
    const project = await fetchBackendProjectById(id, token || providerId);
    return NextResponse.json({ status: "ok", project });
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 503;
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status }
    );
  }
}
