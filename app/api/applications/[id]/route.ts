import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = id?.trim();

    if (!applicationId) {
      return NextResponse.json({ message: "Missing application id." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const fetchOptions = {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store" as RequestCache,
    };

    const detailsResponse = await fetch(`${API_BASE}/api/applications/${applicationId}`, fetchOptions);
    const detailsPayload = await detailsResponse.json().catch(() => ({}));

    if (detailsResponse.ok) {
      return NextResponse.json(detailsPayload, { status: 200 });
    }

    // Fallback for a backend instance that has not yet reloaded the new details route.
    if (detailsResponse.status === 404) {
      const listResponse = await fetch(`${API_BASE}/api/applications/my-applications`, fetchOptions);
      const listPayload = await listResponse.json().catch(() => ({}));

      if (!listResponse.ok) {
        return NextResponse.json(
          { message: listPayload.message || "Unable to load application." },
          { status: listResponse.status }
        );
      }

      const application = Array.isArray(listPayload.applications)
        ? listPayload.applications.find((item: { id?: string }) => item?.id === applicationId)
        : null;

      if (!application) {
        return NextResponse.json({ message: "Application not found." }, { status: 404 });
      }

      return NextResponse.json({ application }, { status: 200 });
    }

    return NextResponse.json(
      { message: detailsPayload.message || "Unable to load application." },
      { status: detailsResponse.status }
    );
  } catch (error) {
    console.error("Application proxy error:", error);
    return NextResponse.json({ message: "Unable to load application." }, { status: 500 });
  }
}
