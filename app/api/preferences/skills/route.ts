import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Preference } from "@/models/preferences";

const TEMP_USER_ID = "temp-user"; // later: replace with real user id

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const skills = body?.skills;

    const primaryRole =
      typeof body?.primaryRole === "string" ? body.primaryRole.trim() : "";

    const experience =
      typeof body?.experience === "string" ? body.experience.trim() : "";

    // Validate skills
    if (!Array.isArray(skills) || skills.some((s: unknown) => typeof s !== "string")) {
      return NextResponse.json(
        { ok: false, error: "skills must be an array of strings" },
        { status: 400 }
      );
    }

    // Clean skills: trim + remove empty + unique
    const cleanedSkills = Array.from(
      new Set((skills as string[]).map((s) => s.trim()).filter(Boolean))
    );

    await connectMongo();

    // Save all fields (role + experience + skills)
    const saved = await Preference.findOneAndUpdate(
      { userId: TEMP_USER_ID },
      {
        $set: {
          primaryRole,
          experience,
          skills: cleanedSkills,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, data: saved });
  } catch (err: unknown) {
    const message = err && typeof err === "object" && "message" in err ? (err as any).message : String(err);
    return NextResponse.json(
      { ok: false, error: message || "Failed to save preferences" },
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
      data:
        doc ?? {
          userId: TEMP_USER_ID,
          primaryRole: "",
          experience: "",
          skills: [],
        },
    });
  } catch (err: unknown) {
    const message = err && typeof err === "object" && "message" in err ? (err as any).message : String(err);
    return NextResponse.json(
      { ok: false, error: message || "Failed to load preferences" },
      { status: 500 }
    );
  }
}