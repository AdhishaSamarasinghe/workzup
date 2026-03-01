"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/message";
import { useConversations, useChat } from "@/lib/hooks";
import {
  ContextMenu,
  EditIcon,
  DeleteIcon,
  CopyIcon,
  ReplyIcon,
  EditMessageModal,
  DeleteConfirmModal,
} from "@/components/ui";
import { Message as MessageType, User } from "@/lib/types";

// ============================================
// CONSTANTS
// ============================================

const CURRENT_USER_ID = "current-user-123";

// ============================================
// MAIN COMPONENT
// ============================================

export default function MessagePage() {
  const router = useRouter();

  // Use the conversations hook for real API calls
  const {
    conversations,
    isLoading: isConversationsLoading,
    refreshConversations,
    markAsRead,
  } = useConversations();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use the chat hook for the selected conversation
  const {
    conversation: jobConversation,
    messages,
    isLoading: isChatLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    setTyping,
  } = useChat(selectedConversationId);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Edit/Delete modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
    null,
  );

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Handle conversation selection (single click - show messages)
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    markAsRead(conversationId);
    // On mobile, navigate to full jobchat page (no preview available)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.push(`/jobchat?id=${conversationId}`);
    }
  };

  // Handle double click - navigate to full jobchat page
  const handleDoubleClickConversation = (conversationId: string) => {
    router.push(`/jobchat?id=${conversationId}`);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConversationId) return;
    await sendMessage(inputValue.trim());
    setInputValue("");
    setTyping(false);
    refreshConversations();
  };

  // Handle message editing
  const handleEditMessage = async (content: string) => {
    if (selectedMessage) {
      await editMessage(selectedMessage.id, content);
      setSelectedMessage(null);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      await deleteMessage(selectedMessage.id);
      setSelectedMessage(null);
      refreshConversations();
    }
  };

  // Handle copy to clipboard
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
    }
  };

  // Navigate to full jobchat page
  const handleOpenFullChat = () => {
    if (selectedConversationId) {
      router.push(`/jobchat?id=${selectedConversationId}`);
    }
  };

  // Get context menu options for a message
  const getMessageContextOptions = (message: MessageType) => {
    const isOwn = message.senderId === CURRENT_USER_ID;
    const options: Array<{
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      danger?: boolean;
    }> = [
      {
        label: "Copy",
        icon: <CopyIcon />,
        onClick: () => handleCopyMessage(message.content),
      },
      {
        label: "Reply",
        icon: <ReplyIcon />,
        onClick: () => {
          setInputValue(`@reply: ${message.content.substring(0, 20)}... `);
        },
      },
    ];

    if (isOwn && !message.isDeleted) {
      options.push({
        label: "Edit",
        icon: <EditIcon />,
        onClick: () => {
          setSelectedMessage(message);
          setEditModalOpen(true);
        },
      });
      options.push({
        label: "Delete",
        icon: <DeleteIcon />,
        onClick: () => {
          setSelectedMessage(message);
          setDeleteModalOpen(true);
        },
        danger: true,
      });
    }

    return options;
  };

  // Transform conversations for the list component
  const transformedConversations = conversations.map((conv) => {
    const participant = (conv as unknown as { participant?: User }).participant;
    return {
      id: conv.id,
      participant: {
        id: participant?.id || "unknown",
        name: participant?.name || "Unknown",
        avatar: participant?.avatar || "/avatars/default.svg",
        role: participant?.role,
      },
      lastMessage: conv.lastMessage?.content || "",
      lastMessageTime: conv.lastMessageTime || "",
      unreadCount: conv.unreadCount,
    };
  });

  if (isConversationsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content - Split View */}
      <div className="flex w-full flex-1 overflow-hidden">
        {/* Conversation List - Left Side */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <ConversationList
            conversations={transformedConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onDoubleClickConversation={handleDoubleClickConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isMobileView={true}
          />
        </div>

        {/* Job Chat Preview - Right Side (Desktop Only) */}
        <div className="hidden md:flex flex-1 flex-col bg-white border-l border-gray-200 h-full overflow-hidden">
          {isChatLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">Loading chat...</div>
            </div>
          ) : jobConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 lg:px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={handleOpenFullChat}
                  >
                    <h1 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600">
                      {jobConversation.job?.title || "Chat"}
                    </h1>
                    <p className="text-sm text-gray-500 truncate">
                      with{" "}
                      {(jobConversation as unknown as { participant?: User })
                        .participant?.name || "Unknown"}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenFullChat}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Open Chat
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const options = getMessageContextOptions(msg);
                      return (
                        <ContextMenu
                          key={msg.id}
                          options={options}
                          disabled={msg.isDeleted}
                        >
                          <MessageBubble
                            message={msg}
                            participant={
                              (
                                jobConversation as unknown as {
                                  participant?: User;
                                }
                              ).participant || { id: "", name: "Unknown" }
                            }
                            isOwn={msg.senderId === CURRENT_USER_ID}
                            options={options}
                          />
                        </ContextMenu>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="mt-2 text-sm text-gray-400 italic">
                    {typingUsers.map((u) => u.name).join(", ")} is typing...
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-3 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to view chat
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center z-50">
        <a
          href="/"
          className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </a>
        <a
          href="/jobs"
          className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">Jobs</span>
        </a>
        <a
          href="/Message"
          className="flex flex-col items-center p-2 text-blue-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">Messages</span>
        </a>
        <a
          href="/profile"
          className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </a>
      </div>

      {/* Edit Message Modal */}
      <EditMessageModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMessage(null);
        }}
        onSave={handleEditMessage}
        initialContent={selectedMessage?.content || ""}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedMessage(null);
        }}
        onConfirm={handleDeleteMessage}
      />
    </>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface MessageBubbleProps {
  message: MessageType;
  participant: User;
  isOwn: boolean;
}

function MessageBubble({
  message,
  participant,
  isOwn,
  options,
}: MessageBubbleProps & { options?: any[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative flex items-end gap-2 max-w-[85%] ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={
              isOwn
                ? "/avatars/default.svg"
                : participant.avatar || "/avatars/default.svg"
            }
            alt={isOwn ? "You" : participant.name}
            className="w-8 h-8 rounded-full object-cover bg-gray-200"
          />
        </div>

        {/* Message Content */}
        <div
          className={`${isOwn ? "items-end" : "items-start"} flex flex-col min-w-0`}
        >
          {/* Sender name and time */}
          <div
            className={`flex items-center gap-2 mb-1 ${
              isOwn ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <span className="text-xs font-medium text-gray-900 truncate">
              {isOwn ? "You" : participant.name}
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {message.timestamp}
            </span>
            {message.isEdited && (
              <span className="text-[10px] text-gray-400 italic">(edited)</span>
            )}
          </div>

          {/* Bubble */}
          <div
            className={`px-3 py-2 rounded-2xl ${
              message.isDeleted
                ? "bg-gray-100 text-gray-400 italic"
                : isOwn
                  ? "bg-blue-500 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
            }`}
          >
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>

          {/* Attachments (responsive) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              {message.attachments.map((att) =>
                att.type === "image" ? (
                  <img
                    key={att.id}
                    src={att.url}
                    alt={att.name}
                    className="max-w-full h-auto rounded-md object-cover border border-gray-100"
                  />
                ) : (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm"
                  >
                    {att.name}
                  </a>
                ),
              )}
            </div>
          )}
        </div>

        {/* Mobile overflow menu (visible on small screens) */}
        {options && (
          <div className="md:hidden ml-1 flex items-start">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                aria-label="Message actions"
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        opt.onClick();
                        setMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${opt.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {opt.icon && <span className="w-4 h-4">{opt.icon}</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
