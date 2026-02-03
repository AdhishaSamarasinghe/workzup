import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_NIC_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const coverLetter = String(formData.get("coverLetter") || "").trim();
    const cv = formData.get("cv");
    const nic = formData.get("nic");

    if (
      !fullName ||
      !email ||
      !phone ||
      !coverLetter ||
      !(cv instanceof File) ||
      !(nic instanceof File)
    ) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_CV_MIME_TYPES.includes(cv.type)) {
      return NextResponse.json(
        { message: "Unsupported CV file type." },
        { status: 400 }
      );
    }

    if (!ALLOWED_NIC_MIME_TYPES.includes(nic.type)) {
      return NextResponse.json(
        { message: "Unsupported NIC file type." },
        { status: 400 }
      );
    }

    if (cv.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "CV file is too large (max 5MB)." },
        { status: 400 }
      );
    }

    if (nic.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "NIC file is too large (max 5MB)." },
        { status: 400 }
      );
    }

    const uploadsRoot = path.join(process.cwd(), "uploads");
    const applicationsRoot = path.join(uploadsRoot, "applications");
    const resumesRoot = path.join(uploadsRoot, "resumes");
    const nicRoot = path.join(uploadsRoot, "nic");

    await Promise.all([
      mkdir(applicationsRoot, { recursive: true }),
      mkdir(resumesRoot, { recursive: true }),
      mkdir(nicRoot, { recursive: true }),
    ]);

    const applicationId = randomUUID();
    const cvExtension = path.extname(cv.name) || ".pdf";
    const safeCvFileName = `${applicationId}${cvExtension}`;
    const resumePath = path.join(resumesRoot, safeCvFileName);

    const nicExtension = path.extname(nic.name) || ".pdf";
    const safeNicFileName = `${applicationId}-nic${nicExtension}`;
    const nicPath = path.join(nicRoot, safeNicFileName);

    const arrayBuffer = await cv.arrayBuffer();
    await writeFile(resumePath, Buffer.from(arrayBuffer));

    const nicBuffer = await nic.arrayBuffer();
    await writeFile(nicPath, Buffer.from(nicBuffer));

    const applicationRecord = {
      id: applicationId,
      fullName,
      email,
      phone,
      coverLetter,
      resumeFile: safeCvFileName,
      nicFile: safeNicFileName,
      createdAt: new Date().toISOString(),
    };

    const recordPath = path.join(applicationsRoot, `${applicationId}.json`);
    await writeFile(recordPath, JSON.stringify(applicationRecord, null, 2));

    return NextResponse.json({
      message: "Application received.",
      id: applicationId,
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { message: "Unable to process application." },
      { status: 500 }
    );
  }
}
