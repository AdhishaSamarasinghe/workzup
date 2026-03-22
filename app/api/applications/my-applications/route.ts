import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URLS } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (API_BASE_URLS.length === 0) {
      return NextResponse.json({ message: "Backend API URL is not configured." }, { status: 500 });
    }

    let response: Response | null = null;
    let lastError: unknown = null;

    for (const baseUrl of API_BASE_URLS) {
      try {
        response = await fetch(`${baseUrl}/api/applications/my-applications`, {
          headers: {
            Authorization: authHeader,
          },
          cache: "no-store",
        });
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!response) {
      throw lastError instanceof Error ? lastError : new Error("Backend unreachable");
    }

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