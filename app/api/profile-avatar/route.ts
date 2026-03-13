import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No avatar uploaded." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json({ message: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: "Avatar must be smaller than 2MB." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const filePath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: {
        avatarPath: `/api/uploads/avatars/${safeName}`,
        avatarUrl: `/api/uploads/avatars/${safeName}`,
      },
    });
  } catch (error) {
    console.error("Profile avatar upload error:", error);
    return NextResponse.json({ message: "Failed to upload avatar." }, { status: 500 });
  }
}
