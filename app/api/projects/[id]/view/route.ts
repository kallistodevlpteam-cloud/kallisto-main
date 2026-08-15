import { NextRequest, NextResponse } from "next/server";
import { markBackendProjectViewed } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ViewRouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: ViewRouteParams) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json(
      { status: "error", message: "Invalid project id" },
      { status: 400 }
    );
  }
  try {
    await markBackendProjectViewed(projectId);
    return NextResponse.json({ status: "ok", project_id: projectId, view: 1 });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: 503 }
    );
  }
}