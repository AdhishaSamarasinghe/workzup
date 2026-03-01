"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat, useJobDetails } from "@/lib/hooks";
import {
  ContextMenu,
  EditIcon,
  DeleteIcon,
  CopyIcon,
  ReplyIcon,
  EditMessageModal,
  DeleteConfirmModal,
  JobEditModal,
} from "@/components/ui";
import { Message as MessageType, User, JobDetails } from "@/lib/types";

// ===========================================
// CONSTANTS
// ===========================================

const CURRENT_USER_ID = "current-user-123";

// ===========================================
// LOADING COMPONENT
// ===========================================

function JobChatLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-gray-500">Loading chat...</div>
    </div>
  );
}

// ===========================================
// MAIN EXPORT - Wrapped in Suspense
// ===========================================

export default function JobChatPageWrapper() {
  return (
    <Suspense fallback={<JobChatLoading />}>
      <JobChatPage />
    </Suspense>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

function JobChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("id") || "conv-1";

  // Use the chat hook for real API calls
  const {
    conversation,
    messages,
    isLoading: isChatLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    setTyping,
    refreshChat,
  } = useChat(conversationId);

  // Use the job details hook
  const { job, updateJob, refreshJob } = useJobDetails(
    conversation?.jobId || null,
  );

  const [inputValue, setInputValue] = useState("");
  const [showJobDetails, setShowJobDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Edit/Delete modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobEditModalOpen, setJobEditModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
    null,
  );

  // Show job details by default on large screens
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        setShowJobDetails(true);
      }
    }
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue.trim());
    setInputValue("");
    setTyping(false);
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
    }
  };

  // Handle job details update
  const handleJobUpdate = async (updates: Partial<JobDetails>) => {
    await updateJob(updates);
    refreshChat(); // Refresh chat to get updated job info
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  // Get participant from conversation
  const participant = (conversation as unknown as { participant?: User })
    ?.participant || {
    id: "",
    name: "Unknown",
    avatar: "/avatars/default.svg",
  };

  // Get job details from conversation or job hook
  const jobDetails = job || conversation?.job;

  if (isChatLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Conversation not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col lg:flex-row bg-white h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Chat Header */}
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              {/* Back button for mobile */}
              <button
                onClick={() => router.push("/message")}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
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

              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                  {jobDetails?.title || "Chat"}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    with {participant.name}
                  </p>
                  {/* Online indicator */}
                  {participant.isOnline && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Online
                    </span>
                  )}
                </div>
              </div>

              {/* Info icon - toggles job details */}
              <button
                onClick={() => setShowJobDetails(!showJobDetails)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                aria-label="Toggle job details"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Job Details Panel */}
          {showJobDetails && (
            <div className="lg:hidden border-b border-gray-100 bg-gray-50 p-4">
              <JobDetailsPanel
                job={jobDetails}
                onClose={() => setShowJobDetails(false)}
                onEdit={() => setJobEditModalOpen(true)}
                isMobile
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Today Separator */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm text-gray-400 bg-white px-3">
                Today
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ContextMenu
                  key={msg.id}
                  options={getMessageContextOptions(msg)}
                  disabled={msg.isDeleted}
                >
                  <MessageBubble
                    message={msg}
                    participant={participant}
                    isOwn={msg.senderId === CURRENT_USER_ID}
                  />
                </ContextMenu>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="max-w-3xl mx-auto mt-4 text-sm text-gray-400 italic flex items-center gap-2">
                <TypingIndicator />
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
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              {/* Attachment button */}
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Emoji button */}
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

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
        </div>

        {/* Desktop Job Details Sidebar */}
        {showJobDetails && (
          <aside className="hidden lg:block w-72 xl:w-80 2xl:w-96 border-l border-gray-100 bg-white overflow-y-auto flex-shrink-0">
            <JobDetailsPanel
              job={jobDetails}
              onClose={() => setShowJobDetails(false)}
              onEdit={() => setJobEditModalOpen(true)}
            />
          </aside>
        )}
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

      {/* Job Edit Modal */}
      <JobEditModal
        isOpen={jobEditModalOpen}
        onClose={() => setJobEditModalOpen(false)}
        onSave={handleJobUpdate}
        job={jobDetails || null}
      />
    </>
  );
}

// ===========================================
// SUB-COMPONENTS
// ===========================================

function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></span>
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></span>
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></span>
    </div>
  );
}

interface MessageBubbleProps {
  message: MessageType;
  participant: User;
  isOwn: boolean;
}

function MessageBubble({ message, participant, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-end gap-2 sm:gap-3 max-w-[90%] xs:max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 hidden xs:block">
          <img
            src={
              isOwn
                ? "/avatars/default.svg"
                : participant.avatar || "/avatars/default.svg"
            }
            alt={isOwn ? "You" : participant.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-gray-200"
          />
        </div>

        {/* Message Content */}
        <div
          className={`${isOwn ? "items-end" : "items-start"} flex flex-col min-w-0`}
        >
          {/* Sender name and time */}
          <div
            className={`flex items-center gap-1 sm:gap-2 mb-1 ${
              isOwn ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {isOwn ? "You" : participant.name}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
              {message.timestamp}
            </span>
            {message.isEdited && (
              <span className="text-[10px] text-gray-400 italic">(edited)</span>
            )}
          </div>

          {/* Bubble */}
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
              message.isDeleted
                ? "bg-gray-100 text-gray-400 italic"
                : isOwn
                  ? "bg-blue-500 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
            }`}
          >
            <p className="text-xs sm:text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>

          {/* Read receipt for own messages */}
          {isOwn && message.isRead && !message.isDeleted && (
            <span className="text-[10px] text-blue-400 mt-1">✓✓ Read</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface JobDetailsPanelProps {
  job: JobDetails | null | undefined;
  onClose?: () => void;
  onEdit?: () => void;
  isMobile?: boolean;
}

function JobDetailsPanel({
  job,
  onClose,
  onEdit,
  isMobile = false,
}: JobDetailsPanelProps) {
  if (!job) return null;

  return (
    <div className={isMobile ? "" : "p-4 lg:p-5 xl:p-6"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Edit job details"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close job details"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            job.status === "open"
              ? "bg-green-100 text-green-800"
              : job.status === "filled"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {job.status?.charAt(0).toUpperCase() + job.status?.slice(1) || "Open"}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 sm:space-y-4">
        {/* PayRate */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">PayRate</p>
            <p className="text-sm text-green-500">{job.payRate}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-red-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Location</p>
            <p className="text-sm text-red-400">{job.location}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Date</p>
            <p className="text-sm text-blue-400">{job.date}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Schedule</p>
            <p className="text-sm text-blue-400">{job.schedule}</p>
          </div>
        </div>

        {/* Description */}
        <div className="pt-2">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Description
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* View Full Job Button */}
        <div className="pt-3 sm:pt-4">
          <a
            href={`/jobs/${job.id}`}
            className="block w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-center text-sm sm:text-base font-medium rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all"
          >
            View Full Job Posting
          </a>
        </div>
      </div>
    </div>
  );
}
