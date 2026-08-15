import { NextRequest, NextResponse } from "next/server";
import { loginBackendProvider, BackendError } from "@/lib/backend/backend-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required." },
        { status: 400 }
      );
    }

    const { token, sp_id } = await loginBackendProvider(email, password);

    const response = NextResponse.json({
      status: "ok",
      token,
      sp_id,
      email,
    });

    // Set cookie for server components & authentication checks
    response.cookies.set("kallisto_auth_token", token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    response.cookies.set("kallisto_provider_id", sp_id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    response.cookies.set("kallisto_simulated_role", "developer", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
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
        message: error instanceof Error ? error.message : "Authentication failed.",
      },
      { status: 500 }
    );
  }
}
