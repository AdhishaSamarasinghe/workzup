import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/applications/my-applications`, {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: payload.message || "Unable to load applications." },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("My applications proxy error:", error);
    return NextResponse.json({ message: "Unable to load applications." }, { status: 500 });
  }
}