import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = "uploads/job-applications";
const ALLOWED_CV_TYPES = ["application/pdf"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const coverLetter = String(formData.get("coverLetter") || "").trim();
    const cv = formData.get("cv");

    // Basic validation for required fields
    if (!name || !email || !phone || !coverLetter || !(cv instanceof File)) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_CV_TYPES.includes(cv.type)) {
      return NextResponse.json(
        { success: false, message: "CV must be a PDF file." },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadRoot = path.join(process.cwd(), UPLOADS_DIR);
    await mkdir(uploadRoot, { recursive: true });

    // Save uploaded CV file
    const applicationId = randomUUID();
    const fileExtension = path.extname(cv.name) || ".pdf";
    const safeFileName = `${applicationId}${fileExtension}`;
    const filePath = path.join(uploadRoot, safeFileName);

    const arrayBuffer = await cv.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    // Log application data (no database yet)
    console.log("New job application:", {
      id: applicationId,
      name,
      email,
      phone,
      coverLetter,
      cvFile: safeFileName,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Job application error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to process application." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
