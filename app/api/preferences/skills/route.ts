import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Preference } from "@/models/preferences";

const TEMP_USER_ID = "temp-user"; // later: replace with real user id

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skills = body?.skills;

    if (!Array.isArray(skills) || skills.some((s) => typeof s !== "string")) {
      return NextResponse.json(
        { ok: false, error: "skills must be an array of strings" },
        { status: 400 }
      );
    }

    const cleaned = Array.from(
      new Set(skills.map((s: string) => s.trim()).filter(Boolean))
    );

    await connectMongo();

    const saved = await Preference.findOneAndUpdate(
      { userId: TEMP_USER_ID },
      { $set: { skills: cleaned } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, data: saved });
  } catch (err: any) {
    // If DB link missing, return clear message
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to save skills" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongo();
    const doc = await Preference.findOne({ userId: TEMP_USER_ID });
    return NextResponse.json({
      ok: true,
      data: doc ?? { userId: TEMP_USER_ID, skills: [] },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load skills" },
      { status: 500 }
    );
  }
}
