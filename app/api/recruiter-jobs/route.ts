import { NextResponse } from "next/server";
import { addRecruiterJob, getRecruiterJobs } from "@/lib/recruiterJobsStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const recruiterId = url.searchParams.get("recruiterId") || "default";
  const data = getRecruiterJobs(recruiterId);
  return NextResponse.json({ ok: true, data }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const recruiterId = String(body.recruiterId || "default");
    const title = String(body.title || "").trim();
    const status = (body.status || "Active") as "Active" | "Completed" | "Expired";
    const applicants = Number(body.applicants || 0);
    const icon = String(body.icon || "🧰");

    if (!title) {
      return NextResponse.json({ ok: false, message: "Job title is required" }, { status: 400 });
    }

    const updatedList = addRecruiterJob({
      recruiterId,
      title,
      status,
      applicants,
      icon,
    });

    return NextResponse.json({ ok: true, data: updatedList }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create job" }, { status: 500 });
  }
}
