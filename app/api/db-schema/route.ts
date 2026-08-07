import { NextResponse } from "next/server";
import { fetchBackendSchema } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await fetchBackendSchema();
  const status = snapshot.connected ? 200 : 503;
  return NextResponse.json(snapshot, { status });
}