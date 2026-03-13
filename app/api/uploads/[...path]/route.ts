import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function isSafePath(parts: string[]) {
  return parts.length > 0 && parts.every((part) => part && part !== "." && part !== ".." && !part.includes("\\"));
}

async function tryReadFile(candidatePath: string) {
  try {
    return await readFile(candidatePath);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;

    if (!Array.isArray(pathParts) || !isSafePath(pathParts)) {
      return NextResponse.json({ message: "Invalid file request." }, { status: 400 });
    }

    const fileName = pathParts[pathParts.length - 1];
    const relativePath = path.join(...pathParts);
    const candidates = [
      path.join(process.cwd(), "uploads", relativePath),
      path.join(process.cwd(), "backend", "uploads", relativePath),
    ];

    let fileBuffer: Buffer | null = null;
    for (const candidate of candidates) {
      fileBuffer = await tryReadFile(candidate);
      if (fileBuffer) break;
    }

    if (!fileBuffer) {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(fileName)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("File fetch error:", error);
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }
}
