import { NextRequest, NextResponse } from "next/server";
import { runBackendQuery } from "@/lib/backend/backend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only allow read-only SELECT-style queries to reach the backend query endpoint.
const READ_ONLY_PATTERN = /^\s*(select|pragma|with)\b/i;

export async function POST(request: NextRequest) {
  let body: { sql?: unknown };
  try {
    body = (await request.json()) as { sql?: unknown };
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  const sql = typeof body.sql === "string" ? body.sql.trim() : "";
  if (!sql) {
    return NextResponse.json({ status: "error", message: "sql is required" }, { status: 400 });
  }
  if (!READ_ONLY_PATTERN.test(sql)) {
    return NextResponse.json(
      { status: "error", message: "Only read-only queries are allowed." },
      { status: 403 }
    );
  }
  if (sql.length > 10_000) {
    return NextResponse.json({ status: "error", message: "Query too long." }, { status: 413 });
  }

  try {
    const result = await runBackendQuery(sql);
    if (result.status !== "ok") {
      return NextResponse.json(
        { status: "error", message: result.message ?? "Backend query failed" },
        { status: 503 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Backend unavailable" },
      { status: 503 }
    );
  }
}