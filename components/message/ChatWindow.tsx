"use client";

import Image from "next/image";
import { ChatWindowProps } from "./types";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  isMobileView = false,
}: ChatWindowProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-500">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white w-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        {/* Back button for mobile */}
        {isMobileView && onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 mr-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to conversations"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={conversation.participant.avatar || "/default-avatar.svg"}
            alt={conversation.participant.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.participant.name}
          </h3>
          {conversation.participant.role && (
            <p className="text-sm text-gray-500 truncate">
              {conversation.participant.role}
            </p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === currentUserId}
              senderAvatar={
                msg.senderId !== currentUserId
                  ? conversation.participant.avatar
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
