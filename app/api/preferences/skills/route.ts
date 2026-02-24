import { NextResponse } from "next/server";

const TEMP_USER_ID = "temp-user"; // later: replace with real user id

type PreferenceDoc = {
  userId: string;
  primaryRole: string;
  experience: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __preferences: PreferenceDoc | undefined;
}

function getDefault(): PreferenceDoc {
  return {
    userId: TEMP_USER_ID,
    primaryRole: "",
    experience: "",
    skills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const skills = body?.skills;

    const primaryRole =
      typeof body?.primaryRole === "string" ? body.primaryRole.trim() : "";

    const experience =
      typeof body?.experience === "string" ? body.experience.trim() : "";

    // Validate skills
    if (
      !Array.isArray(skills) ||
      skills.some((s: unknown) => typeof s !== "string")
    ) {
      return NextResponse.json(
        { ok: false, error: "skills must be an array of strings" },
        { status: 400 },
      );
    }

    // Clean skills: trim + remove empty + unique
    const cleanedSkills = Array.from(
      new Set((skills as string[]).map((s) => s.trim()).filter(Boolean)),
    );

    const now = new Date().toISOString();

    const current = globalThis.__preferences ?? getDefault();

    const newDoc: PreferenceDoc = {
      userId: TEMP_USER_ID,
      primaryRole,
      experience,
      skills: cleanedSkills,
      createdAt: current.createdAt ?? now,
      updatedAt: now,
    };

    globalThis.__preferences = newDoc;

    return NextResponse.json({ ok: true, data: newDoc });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as any).message
        : String(err);
    return NextResponse.json(
      { ok: false, error: message || "Failed to save preferences" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const doc = globalThis.__preferences ?? getDefault();
    return NextResponse.json({ ok: true, data: doc });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as any).message
        : String(err);
    return NextResponse.json(
      { ok: false, error: message || "Failed to load preferences" },
      { status: 500 },
    );
  }
}
