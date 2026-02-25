import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const ALLOWED_FOLDERS = new Set(["resumes", "nic"]);

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string; file: string }> }
) {
  try {
    const { folder, file } = await params;
    const fileName = file?.trim();

    if (!folder || !fileName || !ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ message: "Invalid file request." }, { status: 400 });
    }

    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json({ message: "Invalid file name." }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", folder, fileName);
    const buffer = await readFile(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename=\"${path.basename(fileName)}\"`,
      },
    });
  } catch (error) {
    console.error("File fetch error:", error);
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }
}
