import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

let detectedBackendBase: string | null = null;

async function fileToDataUrl(file: File) {
  const mimeType = file.type || "application/octet-stream";
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${mimeType};base64,${base64}`;
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
    const idFront = formData.get("idFront");
    const idBack = formData.get("idBack");

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
    if (idFront && idFront instanceof File && idFront.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "NIC front must be under 5MB." }, { status: 400 });
    }
    if (idBack && idBack instanceof File && idBack.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "NIC back must be under 5MB." }, { status: 400 });
    }

    // Capture the user JWT from the incoming request headers to prove JobSeeker identity
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized. Please login to apply." }, { status: 401 });
    }

    const submittedCv =
      cv instanceof File && cv.size > 0 ? await fileToDataUrl(cv) : null;
    const submittedIdFront =
      idFront instanceof File && idFront.size > 0 ? await fileToDataUrl(idFront) : null;
    const submittedIdBack =
      idBack instanceof File && idBack.size > 0 ? await fileToDataUrl(idBack) : null;

    const backendResponse = await postApplicationToBackend(authHeader, {
      jobId,
      fullName,
      email,
      phone,
      submittedCv,
      submittedIdFront,
      submittedIdBack,
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
