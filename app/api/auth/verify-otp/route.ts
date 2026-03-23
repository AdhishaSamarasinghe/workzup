import { NextResponse } from "next/server";
import { API_BASE_URLS } from "@/lib/api";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (API_BASE_URLS.length === 0) {
            return NextResponse.json({ message: "Backend API URL is not configured." }, { status: 500 });
        }

        let response: Response | null = null;
        let lastError: unknown = null;

        for (const baseUrl of API_BASE_URLS) {
            try {
                response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
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
        return NextResponse.json(payload, { status: response.status });
    } catch (error) {
        console.error("verify-otp proxy error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
