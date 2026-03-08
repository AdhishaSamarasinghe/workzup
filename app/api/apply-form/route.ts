import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const coverLetter = String(formData.get("coverLetter") || "").trim();
    const cv = formData.get("cv");
    const nic = formData.get("nic");

    // We expect the frontend to start submitting the jobId in the form
    const jobId = String(formData.get("jobId") || "default-job");

    if (!fullName || !email || !phone || !coverLetter || !(cv instanceof File) || !(nic instanceof File)) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (cv.size > MAX_FILE_SIZE || nic.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Files must be under 5MB." }, { status: 400 });
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
        coverLetter
        // Storing CVs natively in S3/Supabase storage should be implemented later, 
        // for now we confirm the application directly on Postgres!
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
