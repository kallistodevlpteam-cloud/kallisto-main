import { NextRequest, NextResponse } from "next/server";
import { fetchBackendProjectById, BackendError } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? undefined;
  try {
    const project = await fetchBackendProjectById(id, token);
    return NextResponse.json({ status: "ok", project });
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 503;
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status }
    );
  }
}
