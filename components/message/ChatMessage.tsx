"use client";

import Image from "next/image";
import { ChatMessageProps } from "./types";

export default function ChatMessage({
  message,
  isOwnMessage,
  senderAvatar,
}: ChatMessageProps) {
  return (
    <div
      className={`flex items-end gap-2 mb-4 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar - only show for other's messages */}
      {!isOwnMessage && senderAvatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={senderAvatar}
            alt="Sender"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Own message avatar */}
      {isOwnMessage && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src="/default-avatar.svg"
            alt="You"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Message bubble */}
      <div className="flex flex-col max-w-xs">
        <div
          className={`px-4 py-3 rounded-2xl ${
            isOwnMessage
              ? "bg-blue-100 text-gray-800 rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span
          className={`text-xs text-gray-400 mt-1 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
