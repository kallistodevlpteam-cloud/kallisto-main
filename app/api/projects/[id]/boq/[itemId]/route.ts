import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuthToken(request: NextRequest): string | undefined {
  const header = request.headers.get("authorization");
  if (header) return header.replace(/^Bearer\s+/i, "");
  return request.cookies.get("kallisto_auth_token")?.value;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  const token = getAuthToken(request);
  try {
    const body = await request.json().catch(() => ({}));
    const res = await backendFetch(
      `${process.env.BACKEND_URL}/api/projects/${id}/boq/${itemId}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" },
      token
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: 503 }
    );
  }
}
