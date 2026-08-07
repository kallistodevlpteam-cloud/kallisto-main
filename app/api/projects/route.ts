import { NextRequest, NextResponse } from "next/server";
import { fetchBackendProjects } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const character = request.nextUrl.searchParams.get("character") ?? undefined;
  try {
    const projects = await fetchBackendProjects(character);
    return NextResponse.json({ status: "ok", projects });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: 503 }
    );
  }
}