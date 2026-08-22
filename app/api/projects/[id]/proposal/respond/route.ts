import { NextRequest, NextResponse } from "next/server";
import { respondToBackendProposal, BackendError } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RespondRouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RespondRouteParams) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json(
      { status: "error", message: "Invalid project id" },
      { status: 400 }
    );
  }
  try {
    const body = await request.json().catch(() => ({}));
    const decision = body.decision as "accept" | "reject";
    if (!decision || !["accept", "reject"].includes(decision)) {
      return NextResponse.json(
        { status: "error", message: "decision must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }
    const result = await respondToBackendProposal(
      projectId,
      decision,
      body.reason ?? "",
      body.negotiation_notes ?? ""
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unavailable";
    const status = error instanceof BackendError ? error.status : 503;
    return NextResponse.json({ status: "error", message }, { status });
  }
}
