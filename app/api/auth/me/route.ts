import { NextRequest, NextResponse } from "next/server";
import { fetchBackendMe, BackendError } from "@/lib/backend/backend-client";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("kallisto_auth_token")?.value;
    const token = authHeader?.replace(/^Bearer\s+/i, "") || cookieToken;

    const data = await fetchBackendMe(token);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch user session.",
      },
      { status: 500 }
    );
  }
}
