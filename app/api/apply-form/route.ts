import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const APPLICATION_UPLOADS_DIR = path.join(process.cwd(), "backend", "uploads", "applications");

let detectedBackendBase: string | null = null;

async function persistUpload(file: File, prefix: string) {
  const extension = path.extname(file.name) || "";
  const safeName = `${prefix}-${Date.now()}-${randomUUID()}${extension}`;
  const targetPath = path.join(APPLICATION_UPLOADS_DIR, safeName);

  await mkdir(APPLICATION_UPLOADS_DIR, { recursive: true });
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return `uploads/applications/${safeName}`;
}

async function postApplicationToBackend(authHeader: string, body: Record<string, unknown>) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  const candidateBases = [
    detectedBackendBase,
    API_BASE,
    API_BASE.includes("localhost:5000") ? API_BASE.replace("5000", "5001") : null,
  ].filter((value, index, array): value is string => !!value && array.indexOf(value) === index);

  let lastError: unknown = null;

  for (const base of candidateBases) {
    try {
      const response = await fetch(`${base}/api/applications`, requestOptions);
      detectedBackendBase = base;
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Backend unavailable");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const cv = formData.get("cv");
    const nic = formData.get("nic");

    const jobId = String(formData.get("jobId") || "").trim();

    // Make file uploads optional at this layer since users might have them on their profile
    if (!fullName || !email || !phone) {
      return NextResponse.json({ message: "Please fill all required fields." }, { status: 400 });
    }

    if (!jobId) {
      return NextResponse.json({ message: "Job reference is missing. Please open the job and apply again." }, { status: 400 });
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

    const backendResponse = await postApplicationToBackend(authHeader, {
      jobId,
      fullName,
      email,
      phone,
      submittedCv,
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
      { message: "Unable to reach the application server/database. Please ensure backend is running and try again." },
      { status: 500 }
    );
  }
}
