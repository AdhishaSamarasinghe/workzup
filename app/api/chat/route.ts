import { NextResponse } from "next/server";

import type {
  ChatHistoryMessage,
  ChatRequestBody,
  ChatResponseBody,
  ChatUserProfile,
} from "@/lib/chatbot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeHistory(
  value: unknown,
): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is ChatHistoryMessage => {
      return (
        isPlainObject(item) &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
      );
    })
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-8);
}

function normalizeProfile(value: unknown): ChatUserProfile | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const skills = Array.isArray(value.skills)
    ? value.skills.filter((skill): skill is string => typeof skill === "string")
    : [];
  const experience = Array.isArray(value.experience) ? value.experience : [];
  const languages = Array.isArray(value.languages)
    ? value.languages.filter(
        (language): language is string => typeof language === "string",
      )
    : [];

  return {
    id: typeof value.id === "string" ? value.id : undefined,
    name: typeof value.name === "string" ? value.name : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
    bio: typeof value.bio === "string" ? value.bio : undefined,
    skills,
    experience,
    languages,
    availableTimes:
      typeof value.availableTimes === "string" ? value.availableTimes : undefined,
    preferences: isPlainObject(value.preferences) ? value.preferences : null,
  };
}

function formatExperienceItem(item: unknown) {
  if (!isPlainObject(item)) {
    return null;
  }

  const role =
    typeof item.role === "string"
      ? item.role
      : typeof item.title === "string"
        ? item.title
        : "";
  const company =
    typeof item.company === "string"
      ? item.company
      : typeof item.organization === "string"
        ? item.organization
        : "";
  const duration = typeof item.duration === "string" ? item.duration : "";
  const description =
    typeof item.description === "string" ? item.description : "";

  const headlineParts = [role, company].filter(Boolean);
  const headline = headlineParts.join(" at ");
  return [headline, duration, description].filter(Boolean).join(" | ").trim();
}

function safeJsonSnippet(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unavailable";
  }
}

function buildProfileContext(userProfile: ChatUserProfile | null) {
  if (!userProfile) {
    return [
      "Authenticated profile: unavailable.",
      "Personalized guidance should stay general unless the user provides more details.",
    ].join("\n");
  }

  const experienceLines = (userProfile.experience || [])
    .map(formatExperienceItem)
    .filter(Boolean)
    .slice(0, 5);

  return [
    "Authenticated profile: available",
    `Name: ${userProfile.name || "Not provided"}`,
    `Current title: ${userProfile.title || "Not provided"}`,
    `Location: ${userProfile.location || "Not provided"}`,
    `Bio: ${userProfile.bio || "Not provided"}`,
    `Skills: ${
      userProfile.skills && userProfile.skills.length > 0
        ? userProfile.skills.join(", ")
        : "None listed"
    }`,
    `Languages: ${
      userProfile.languages && userProfile.languages.length > 0
        ? userProfile.languages.join(", ")
        : "None listed"
    }`,
    `Availability: ${userProfile.availableTimes || "Not provided"}`,
    `Experience: ${
      experienceLines.length > 0 ? experienceLines.join(" || ") : "None listed"
    }`,
    `Preferences: ${safeJsonSnippet(userProfile.preferences || {})}`,
  ].join("\n");
}

function extractAssistantContent(payload: unknown) {
  if (!isPlainObject(payload) || !Array.isArray(payload.choices)) {
    return "";
  }

  const choice = payload.choices[0];
  if (!isPlainObject(choice) || !isPlainObject(choice.message)) {
    return "";
  }

  const { content } = choice.message;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (isPlainObject(part) && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function buildSystemPrompt() {
  return [
    "You are an AI assistant for WorkzUp, a job platform.",
    "Help users with job suggestions, profile improvements, and platform guidance.",
    "Use the user's profile data when relevant.",
    "Tone: professional, helpful, concise, career-focused.",
    "WorkzUp supports browsing jobs, saving jobs, applying for jobs, viewing and improving profiles, messaging, recruiter and employer job posting, and account settings.",
    "If the user asks for job suggestions, recommend the best-fitting roles based on skills, experience, and preferences, and explain each match briefly.",
    "Unless live WorkzUp job listings are explicitly provided in the prompt, recommend role types or search directions instead of inventing specific employers, openings, salaries, or locations.",
    "If the user's profile is incomplete or weak, suggest the highest-impact improvements first.",
    "If the user asks about their profile, give actionable advice they can apply inside WorkzUp.",
    "If the user's question is unclear, ask one brief clarifying question instead of guessing.",
    "Do not invent profile details, platform features, or job history.",
    "If a request is unrelated to careers or WorkzUp, politely steer the user back to WorkzUp or career help.",
    "Keep responses readable and structured with short paragraphs or compact bullets when useful.",
  ].join(" ");
}

function resolveGroqModel() {
  return process.env.GROQ_CHAT_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

async function requestGroqChatCompletion({
  apiKey,
  model,
  message,
  history,
  userProfile,
  signal,
}: {
  apiKey: string;
  model: string;
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userProfile: ChatUserProfile | null;
  signal: AbortSignal;
}) {
  const groqResponse = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "system",
          content: `User profile context:\n${buildProfileContext(userProfile)}`,
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
    }),
    signal,
  });

  const payload = await groqResponse.json().catch(() => null);

  return {
    groqResponse,
    payload,
  };
}

export async function POST(request: Request) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Groq API is not configured. Set GROQ_API_KEY on the server." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "A non-empty message is required." },
        { status: 400 },
      );
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep it under 4000 characters." },
        { status: 400 },
      );
    }

    const history = normalizeHistory(body?.messages);
    const userProfile = normalizeProfile(body?.userProfile);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const preferredModel = resolveGroqModel();

    try {
      let { groqResponse, payload } = await requestGroqChatCompletion({
        apiKey: groqApiKey,
        model: preferredModel,
        message,
        history,
        userProfile,
        signal: controller.signal,
      });

      const upstreamMessage =
        (isPlainObject(payload) &&
          isPlainObject(payload.error) &&
          typeof payload.error.message === "string" &&
          payload.error.message) ||
        "The AI service could not process the request.";

      const shouldRetryWithFallback =
        !groqResponse.ok &&
        preferredModel !== DEFAULT_GROQ_MODEL &&
        /decommissioned|no longer supported|model/i.test(upstreamMessage);

      if (shouldRetryWithFallback) {
        ({ groqResponse, payload } = await requestGroqChatCompletion({
          apiKey: groqApiKey,
          model: DEFAULT_GROQ_MODEL,
          message,
          history,
          userProfile,
          signal: controller.signal,
        }));
      }

      if (!groqResponse.ok) {
        const finalUpstreamMessage =
          (isPlainObject(payload) &&
            isPlainObject(payload.error) &&
            typeof payload.error.message === "string" &&
            payload.error.message) ||
          "The AI service could not process the request.";

        if (groqResponse.status === 429) {
          return NextResponse.json(
            {
              error:
                "The WorkzUp AI assistant is receiving too many requests right now. Please try again in a moment.",
            },
            { status: 429 },
          );
        }

        return NextResponse.json(
          { error: finalUpstreamMessage },
          { status: groqResponse.status },
        );
      }

      const content = extractAssistantContent(payload);

      if (!content) {
        return NextResponse.json(
          { error: "The AI service returned an empty response." },
          { status: 502 },
        );
      }

      const response: ChatResponseBody = {
        role: "assistant",
        content,
      };

      return NextResponse.json(response);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "The AI assistant took too long to respond. Please try again." },
        { status: 504 },
      );
    }

    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the chat request." },
      { status: 500 },
    );
  }
}
