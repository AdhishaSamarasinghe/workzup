"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { apiFetch } from "@/lib/api";
import type {
  ChatHistoryMessage,
  ChatRequestBody,
  ChatResponseBody,
  ChatUserProfile,
} from "@/lib/chatbot";

type ChatMessage = ChatHistoryMessage & { id: string };

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi there! I'm the WorkzUp AI assistant. Ask me about jobs, your profile, or how to use the platform.",
};

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("workzup_preferences");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeUserProfile(
  profile: Record<string, unknown>,
  preferences: Record<string, unknown> | null,
): ChatUserProfile {
  return {
    id: typeof profile.id === "string" ? profile.id : undefined,
    name: typeof profile.name === "string" ? profile.name : undefined,
    email: typeof profile.email === "string" ? profile.email : undefined,
    title: typeof profile.title === "string" ? profile.title : undefined,
    location:
      typeof profile.location === "string" ? profile.location : undefined,
    bio:
      typeof profile.aboutMe === "string"
        ? profile.aboutMe
        : typeof profile.bio === "string"
          ? profile.bio
          : "",
    skills: Array.isArray(profile.skills)
      ? profile.skills.filter((item): item is string => typeof item === "string")
      : [],
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    languages: Array.isArray(profile.languages)
      ? profile.languages.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    availableTimes:
      typeof profile.availableTimes === "string"
        ? profile.availableTimes
        : "",
    preferences,
  };
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<
    ChatUserProfile | null | undefined
  >(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileRequestRef = useRef<Promise<ChatUserProfile | null> | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleToggleChat = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen && userProfile === undefined) {
      void loadUserProfile();
    }
  };

  async function loadUserProfile() {
    if (userProfile !== undefined) {
      return userProfile;
    }

    if (profileRequestRef.current) {
      return profileRequestRef.current;
    }

    const request = (async () => {
      try {
        const profile = await apiFetch("/api/auth/profile");
        const localPreferences = readStoredPreferences();
        let preferences = localPreferences;

        if (
          profile &&
          typeof profile === "object" &&
          "id" in profile &&
          typeof profile.id === "string"
        ) {
          try {
            const preferenceResponse = await apiFetch(`/preferences/${profile.id}`);
            if (
              preferenceResponse &&
              typeof preferenceResponse === "object" &&
              "data" in preferenceResponse &&
              preferenceResponse.data &&
              typeof preferenceResponse.data === "object"
            ) {
              preferences = preferenceResponse.data as Record<string, unknown>;
            }
          } catch (preferenceError) {
            console.warn("Could not load chat preferences:", preferenceError);
          }
        }

        const normalized = normalizeUserProfile(
          profile && typeof profile === "object"
            ? (profile as Record<string, unknown>)
            : {},
          preferences,
        );
        setUserProfile(normalized);
        return normalized;
      } catch (error) {
        console.warn(
          "Chat profile unavailable, continuing without personalization.",
          error,
        );
        setUserProfile(null);
        return null;
      } finally {
        profileRequestRef.current = null;
      }
    })();

    profileRequestRef.current = request;
    return request;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    const history = messages
      .filter((message) => message.id !== WELCOME_MESSAGE.id)
      .slice(-6)
      .map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      }));
    const nextUserMessage = createMessage("user", content);

    setInput("");
    setMessages((current) => [...current, nextUserMessage]);
    setIsLoading(true);

    try {
      const profile = await loadUserProfile();
      const payload: ChatRequestBody = {
        message: content,
        userProfile: profile,
        messages: history,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | ChatResponseBody
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "error" in data && typeof data.error === "string"
            ? data.error
            : "The WorkzUp AI assistant could not respond right now.",
        );
      }

      const assistantContent =
        data && "content" in data && typeof data.content === "string"
          ? data.content
          : "I couldn't generate a response just now. Please try again.";

      setMessages((current) => [
        ...current,
        createMessage("assistant", assistantContent),
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          err instanceof Error
            ? err.message
            : "I ran into an issue while contacting the WorkzUp AI assistant. Please try again.",
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  return (
    <>
      <button
        onClick={handleToggleChat}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 rounded-full bg-[#6b8bff] hover:bg-[#5a7ae6] text-white flex items-center justify-center shadow-[0_8px_30px_rgb(107,139,255,0.4)] hover:shadow-[0_8px_30px_rgb(107,139,255,0.6)] hover:-translate-y-1 transition-all z-50 focus:outline-none focus:ring-2 focus:ring-[#6b8bff] focus:ring-offset-2 ${isOpen ? "rotate-90 scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"}`}
        aria-label="Open support chat"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      <div
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[90vw] sm:w-[400px] bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-gray-100 flex flex-col z-50 overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 pointer-events-none translate-y-4"}`}
        style={{ height: "600px", maxHeight: "80vh" }}
      >
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#f8f9fc] rounded-full flex items-center justify-center ring-1 ring-gray-100">
              <svg
                className="w-6 h-6 text-[#6b8bff]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-[800] text-[#0B0F19] text-[17px] tracking-tight">
                Workzup Support
              </h3>
              <p className="text-[#6b7280] text-[13px] font-[500] flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                AI Assistant Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-[#0B0F19] p-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#f8f9fc] flex flex-col gap-5">
          <div className="flex w-full">
            <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-white ring-1 ring-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm mb-1">
                <svg
                  className="w-4 h-4 text-[#6b8bff]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="bg-white border border-gray-100 rounded-[18px] p-4 max-w-[85%] shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-bl-sm text-[#4b5563] text-[15px] leading-relaxed font-[500]">
                {WELCOME_MESSAGE.content}
              </div>
            </div>
          </div>

          {messages
            .filter((message) => message.id !== WELCOME_MESSAGE.id)
            .map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-4 rounded-[18px] max-w-[85%] text-[15px] leading-relaxed shadow-[0_4px_20px_rgb(0,0,0,0.03)] font-[500] ${message.role === "user" ? "bg-[#6b8bff] text-white rounded-br-sm" : "bg-white border border-gray-100 text-[#4b5563] ml-11 rounded-bl-sm"}`}
                >
                  <span className="whitespace-pre-wrap">{message.content}</span>
                </div>
              </div>
            ))}

          {isLoading && (
            <div className="flex w-full justify-start pl-11">
              <div className="bg-white border border-gray-100 rounded-[18px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-bl-sm flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-[#6b8bff]/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-[#6b8bff]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-[#6b8bff] rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Type your message..."
              className="w-full bg-[#f8fafc] border border-gray-200 rounded-[14px] px-4 py-3.5 pr-14 focus:outline-none focus:ring-4 focus:ring-[#6b8bff]/10 focus:border-[#6b8bff] text-[15px] font-[500] text-[#111827] placeholder-[#9ca3af] focus:bg-white focus:shadow-sm disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 rounded-[10px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b8bff] disabled:opacity-50 disabled:bg-transparent disabled:text-[#d1d5db] data-[active=true]:bg-[#6b8bff] data-[active=true]:text-white data-[active=true]:hover:bg-[#5a7ae6] data-[active=false]:bg-[#f1f5f9] data-[active=false]:text-[#9ca3af] data-[active=false]:hover:bg-[#e2e8f0] data-[active=false]:hover:text-[#6b8bff]"
              data-active={!!input.trim() && !isLoading}
            >
              <svg
                className="w-5 h-5 flex-shrink-0 rotate-90 translate-x-px"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
