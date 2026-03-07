import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = id?.trim();
    if (!applicationId) {
      return NextResponse.json({ message: "Missing application id." }, { status: 400 });
    }

    const recordPath = path.join(
      process.cwd(),
      "uploads",
      "applications",
      `${applicationId}.json`
    );

    const rawRecord = await readFile(recordPath, "utf-8");
    const record = JSON.parse(rawRecord);

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Application fetch error:", error);
    return NextResponse.json(
      { message: "Application not found." },
      { status: 404 }
    );
  }
}
