import { NextRequest, NextResponse } from "next/server";
import { createBackendProposal, BackendError } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProposalRouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: ProposalRouteParams) {
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
    const body = await request.json();
    const result = await createBackendProposal(
      projectId,
      token,
      body.total_amount,
      body.rate_notes,
      body.timeline_notes,
      body.scope_summary
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unavailable";
    const status = error instanceof BackendError ? error.status : 503;
    return NextResponse.json({ status: "error", message }, { status });
  }
}
