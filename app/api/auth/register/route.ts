import { NextResponse } from "next/server";
import { API_BASE_URLS } from "@/lib/api";

function parseErrorMessage(payload: unknown, fallback: string): string {
    if (payload && typeof payload === "object" && "message" in payload) {
        const message = (payload as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }
    return fallback;
}

export async function POST(request: Request) {
    try {
        if (API_BASE_URLS.length === 0) {
            return NextResponse.json({ message: "Backend API URL is not configured." }, { status: 500 });
        }

        const contentType = request.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        let jsonBody: unknown = null;
        let formEntries: Array<[string, FormDataEntryValue]> = [];

        if (isJson) {
            jsonBody = await request.json();
        } else {
            const formData = await request.formData();
            formEntries = Array.from(formData.entries());
        }

        let response: Response | null = null;
        let lastError: unknown = null;

        for (const baseUrl of API_BASE_URLS) {
            try {
                const targetUrl = `${baseUrl}/api/auth/register`;
                if (isJson) {
                    response = await fetch(targetUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(jsonBody),
                        cache: "no-store",
                    });
                } else {
                    const outboundFormData = new FormData();
                    for (const [key, value] of formEntries) {
                        outboundFormData.append(key, value);
                    }

                    response = await fetch(targetUrl, {
                        method: "POST",
                        body: outboundFormData,
                        cache: "no-store",
                    });
                }
                break;
            } catch (error) {
                lastError = error;
            }
        }

        if (!response) {
            throw lastError instanceof Error ? lastError : new Error("Backend unreachable");
        }

        const responseType = response.headers.get("content-type") || "";
        if (responseType.includes("application/json")) {
            const payload = await response.json().catch(() => ({}));
            return NextResponse.json(payload, { status: response.status });
        }

        const textPayload = await response.text();
        const fallback = response.ok ? "Registration completed successfully." : "Registration failed";
        return NextResponse.json(
            { message: textPayload || fallback },
            { status: response.status },
        );
    } catch (error) {
        console.error("register proxy error:", error);
        return NextResponse.json({ message: parseErrorMessage(error, "Internal server error") }, { status: 500 });
    }
}
