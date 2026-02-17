"use client";

import Image from "next/image";
import Link from "next/link";
import { ConversationListProps } from "./types";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isMobileView = false,
}: ConversationListProps) {
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header with logo on mobile */}
      <div className="p-4 md:p-6 border-b border-gray-100">
        {/* Logo visible only on mobile (click navigates home) */}
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <Link href="/" aria-label="Go to homepage">
            <Image
              src="/logo_main.png"
              alt="Workzup"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
          Messages
        </h2>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Conversations."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}
