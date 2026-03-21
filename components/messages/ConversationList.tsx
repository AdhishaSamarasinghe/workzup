"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { useDeferredValue, useMemo } from "react";
import type { ConversationSummary } from "@/lib/messaging/types";

type ConversationListProps = {
  conversations: ConversationSummary[];
  loading: boolean;
  selectedConversationId: string | null;
  searchValue: string;
  onlineUserIds: string[];
  typingConversationIds: string[];
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
};

function formatConversationTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDistanceToNowStrict(date, { addSuffix: true });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ConversationList({
  conversations,
  loading,
  selectedConversationId,
  searchValue,
  onlineUserIds,
  typingConversationIds,
  onSearchChange,
  onSelectConversation,
}: ConversationListProps) {
  const deferredSearch = useDeferredValue(searchValue);
  const filteredConversations = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.other_user_name.toLowerCase().includes(query) ||
        (conversation.other_user_email || "").toLowerCase().includes(query) ||
        (conversation.last_message || "").toLowerCase().includes(query)
      );
    });
  }, [conversations, deferredSearch]);

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-b border-slate-200 bg-white md:w-[360px] md:border-b-0 md:border-r">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Inbox</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Messages</h2>
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search conversations"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#6b8bff] focus:bg-white focus:ring-4 focus:ring-[#6b8bff]/10"
        />
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-44 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            {conversations.length === 0 ? "No conversations yet." : "No conversations match your search."}
          </div>
        ) : (
          <div className="p-3">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === selectedConversationId;
              const isOnline = onlineUserIds.includes(conversation.other_user_id);
              const isTyping = typingConversationIds.includes(conversation.id);

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`mb-2 flex w-full items-start gap-3 rounded-3xl px-4 py-4 text-left transition ${
                    isActive
                      ? "bg-[#eef2ff] shadow-[inset_0_0_0_1px_rgba(107,139,255,0.35)]"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6b8bff] to-[#8be3c7] text-sm font-semibold text-white">
                      {getInitials(conversation.other_user_name || "WU")}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        isOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {conversation.other_user_name}
                        </p>
                        <p
                          className={`mt-0.5 text-[11px] ${
                            isOnline ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatConversationTime(conversation.last_message_at || conversation.created_at)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p
                        className={`truncate text-sm ${
                          isTyping ? "font-medium text-emerald-600" : "text-slate-500"
                        }`}
                      >
                        {isTyping ? "Typing..." : conversation.last_message || "Start the conversation"}
                      </p>
                      {conversation.unread_count > 0 ? (
                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#6b8bff] px-2 py-1 text-[11px] font-semibold text-white">
                          {conversation.unread_count}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
