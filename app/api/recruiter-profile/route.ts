// app/api/recruiter-profile/route.ts
import { NextResponse } from "next/server";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  type RecruiterProfile,
} from "@/lib/recruiterStore";

export const dynamic = "force-dynamic";

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanWebsite(input: string) {
  const v = input.trim();
  if (!v) return "";
  return v.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export async function GET() {
  const data = getRecruiterProfile();
  return NextResponse.json({ ok: true, data }, { status: 200 });
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<RecruiterProfile>;

    // validation
    if (body.contactEmail && !isEmail(body.contactEmail)) {
      return NextResponse.json({ ok: false, message: "Invalid email format" }, { status: 400 });
    }

    // protect huge base64 logos (optional but good)
    if (body.logoBase64 && body.logoBase64.length > 1_500_000) {
      return NextResponse.json({ ok: false, message: "Logo too large. Upload a smaller image." }, { status: 413 });
    }

    const updated = updateRecruiterProfile({
      ...body,
      website: body.website !== undefined ? cleanWebsite(body.website) : undefined,
    });

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to update recruiter profile" }, { status: 500 });
  }
}
