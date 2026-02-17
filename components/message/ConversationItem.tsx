"use client";

import Image from "next/image";
import { ConversationItemProps } from "./types";

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-all ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          <Image
            src={conversation.participant.avatar || "/default-avatar.svg"}
            alt={conversation.participant.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.participant.name}
          </h3>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {conversation.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500 truncate">
            {conversation.participant.role && (
              <span className="text-gray-400">
                {conversation.participant.role}
              </span>
            )}
            {conversation.participant.role && conversation.lastMessage && " · "}
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
