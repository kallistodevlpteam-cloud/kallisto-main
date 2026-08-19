import { NextRequest, NextResponse } from "next/server";
import { acceptBackendProject, BackendError } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AcceptRouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: AcceptRouteParams) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json(
      { status: "error", message: "Invalid project id" },
      { status: 400 }
    );
  }
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? undefined;
    const projectCharacter = await acceptBackendProject(projectId, token);
    return NextResponse.json({
      status: "ok",
      project_id: projectId,
      project_character: projectCharacter,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unavailable";
    const status = error instanceof BackendError ? error.status : 503;
    return NextResponse.json({ status: "error", message }, { status });
  }
}