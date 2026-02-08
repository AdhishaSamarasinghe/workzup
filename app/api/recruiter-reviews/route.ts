// app/api/recruiter-reviews/route.ts
import { NextResponse } from "next/server";
import { addRecruiterReview, getRecruiterReviews } from "@/lib/recruiterReviewStore";

export const dynamic = "force-dynamic";

function clampRating(r: number) {
  if (Number.isNaN(r)) return 1;
  return Math.max(1, Math.min(5, r));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const recruiterId = url.searchParams.get("recruiterId") || "default";

  const data = getRecruiterReviews(recruiterId);
  return NextResponse.json({ ok: true, data }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const recruiterId = String(body.recruiterId || "default");
    const reviewerName = String(body.reviewerName || "").trim();
    const comment = String(body.comment || "").trim();
    const rating = clampRating(Number(body.rating));

    if (!reviewerName) {
      return NextResponse.json({ ok: false, message: "Reviewer name is required" }, { status: 400 });
    }
    if (!comment || comment.length < 3) {
      return NextResponse.json({ ok: false, message: "Comment is too short" }, { status: 400 });
    }

    const updatedList = addRecruiterReview({
      recruiterId,
      reviewerName,
      rating,
      comment,
    });

    return NextResponse.json({ ok: true, data: updatedList }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create review" }, { status: 500 });
  }
}
