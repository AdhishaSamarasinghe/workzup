"use client";

import { format } from "date-fns";
import { useEffect, useRef } from "react";
import type { ConversationSummary, MessageRow } from "@/lib/messaging/types";
import MessageInput from "./MessageInput";

type ChatWindowProps = {
  currentUserId: string;
  conversation: ConversationSummary | null;
  loading: boolean;
  sending: boolean;
  error: string | null;
  messages: MessageRow[];
  onSendMessage: (content: string) => Promise<void>;
};

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return format(date, "p");
}

function formatMessageDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return format(date, "EEEE, MMM d");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ChatWindow({
  currentUserId,
  conversation,
  loading,
  sending,
  error,
  messages,
  onSendMessage,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversation?.id]);

  if (!conversation) {
    return (
      <section className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(107,139,255,0.12),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#6b8bff]">
            <span className="text-xl font-semibold">WU</span>
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">Select a conversation</h3>
          <p className="mt-2 text-sm text-slate-500">
            Choose a chat from the list to start messaging in real time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6b8bff] to-[#8be3c7] text-sm font-semibold text-white">
            {getInitials(conversation.other_user_name || "WU")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{conversation.other_user_name}</p>
            <p className="truncate text-xs text-slate-500">
              {conversation.other_user_email || "Direct conversation"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 scroll-smooth sm:px-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`max-w-[70%] animate-pulse rounded-3xl px-4 py-3 ${
                  index % 2 === 0 ? "bg-white" : "ml-auto bg-[#dfe7ff]"
                }`}
              >
                <div className="h-3 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[220px] items-center justify-center text-center text-sm text-slate-500">
            No messages yet. Send the first one.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const showDayLabel =
                !previousMessage ||
                formatMessageDay(previousMessage.created_at) !== formatMessageDay(message.created_at);
              const isMine = message.sender_id === currentUserId;

              return (
                <div key={message.id}>
                  {showDayLabel ? (
                    <div className="my-5 flex justify-center">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">
                        {formatMessageDay(message.created_at)}
                      </span>
                    </div>
                  ) : null}

                  <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] rounded-[22px] px-4 py-3 shadow-sm sm:max-w-[70%] ${
                        isMine
                          ? "rounded-br-md bg-[#6b8bff] text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                      <div
                        className={`mt-2 text-[11px] ${
                          isMine ? "text-white/70" : "text-slate-400"
                        }`}
                      >
                        {formatMessageTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error ? (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-6">
          {error}
        </div>
      ) : null}

      <MessageInput disabled={!conversation} sending={sending} onSend={onSendMessage} />
    </section>
  );
}
