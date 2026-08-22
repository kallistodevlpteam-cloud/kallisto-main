import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuthToken(request: NextRequest): string | undefined {
  const header = request.headers.get("authorization");
  if (header) return header.replace(/^Bearer\s+/i, "");
  return request.cookies.get("kallisto_auth_token")?.value;
}

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);
  const location = request.nextUrl.searchParams.get("location") ?? undefined;
  try {
    const url = new URL(`${process.env.BACKEND_URL}/api/providers/nearby`);
    if (location) url.searchParams.set("location", location);
    const res = await backendFetch(url.toString(), { cache: "no-store" }, token);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: 503 }
    );
  }
}
