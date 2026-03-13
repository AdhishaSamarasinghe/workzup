import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const APPLICATION_UPLOADS_DIR = path.join(process.cwd(), "backend", "uploads", "applications");

async function persistUpload(file: File, prefix: string) {
  const extension = path.extname(file.name) || "";
  const safeName = `${prefix}-${Date.now()}-${randomUUID()}${extension}`;
  const targetPath = path.join(APPLICATION_UPLOADS_DIR, safeName);

  await mkdir(APPLICATION_UPLOADS_DIR, { recursive: true });
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return `uploads/applications/${safeName}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const cv = formData.get("cv");
    const nic = formData.get("nic");

    // We expect the frontend to start submitting the jobId in the form
    const jobId = String(formData.get("jobId") || "default-job");

    // Make file uploads optional at this layer since users might have them on their profile
    if (!fullName || !email || !phone) {
      return NextResponse.json({ message: "Please fill all required fields." }, { status: 400 });
    }

    if (cv && cv instanceof File && cv.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "CV must be under 5MB." }, { status: 400 });
    }
    if (nic && nic instanceof File && nic.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "NIC must be under 5MB." }, { status: 400 });
    }

    let submittedCv: string | null = null;

    if (cv instanceof File && cv.size > 0) {
      submittedCv = await persistUpload(cv, "application-cv");
    }

    // Capture the user JWT from the incoming request headers to prove JobSeeker identity
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized. Please login to apply." }, { status: 401 });
    }

    const backendResponse = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: {
        // Forward the JWT to the backend REST API
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobId,
        fullName,
        email,
        phone,
        submittedCv,
      })
    });

    const payload = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: payload.message || "Failed to submit application to backend." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      message: "Application securely mapped to Postgres!",
      id: payload.application?.id,
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { message: "Unable to process application." },
      { status: 500 }
    );
  }
}
