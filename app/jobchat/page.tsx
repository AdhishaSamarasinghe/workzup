"use client";

import React, { useState, useEffect, useRef } from "react";

// ===========================================
// TYPES - Ready for backend integration
// ===========================================

type Participant = {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
};

type JobDetails = {
  id: string;
  title: string;
  payRate: string;
  location: string;
  date: string;
  schedule: string;
  description: string;
};

type ChatConversation = {
  id: string;
  jobId: string;
  participant: Participant;
  job: JobDetails;
};

// ===========================================
// MOCK DATA - Replace with API calls
// ===========================================

const CURRENT_USER_ID = "current-user-123";

// Mock conversation data - Replace with: GET /api/jobchat/:conversationId
const mockConversation: ChatConversation = {
  id: "conv-1",
  jobId: "job-1",
  participant: {
    id: "user-jane",
    name: "Jane Doe",
    avatar: "/avatars/jane.svg",
    role: "Hiring Manager",
  },
  job: {
    id: "job-1",
    title: "Urgent Barista Needed",
    payRate: "Rs.3000",
    location: "Colombo",
    date: "Nov 25",
    schedule: "9.00A< - 5.00 PM",
    description:
      "We're looking for an experienced barista to help out during a busy event.Must be proficient with espresso machine and latte art.",
  },
};

// Mock messages - Replace with: GET /api/jobchat/:conversationId/messages
const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-jane",
    content:
      "Hi. i swa your application for the barsita postion. Are you available for a quick chat tomorrow morning?",
    timestamp: "10.59p.m",
    isRead: true,
  },
  {
    id: "msg-2",
    senderId: CURRENT_USER_ID,
    content: "Hello! Yes I;m Avalibale. What time works best for You?",
    timestamp: "10.59p.m",
    isRead: true,
  },
  {
    id: "msg-3",
    senderId: "user-jane",
    content: "Great.How about 9.30 Am?",
    timestamp: "10.59p.m",
    isRead: true,
  },
];

// ===========================================
// API FUNCTIONS - Ready for backend
// ===========================================

/**
 * Fetch conversation details
 * Replace with: const res = await fetch(`/api/jobchat/${conversationId}`);
 */
async function fetchConversation(
  conversationId: string,
): Promise<ChatConversation> {
  // TODO: Replace with actual API call
  return new Promise((resolve) =>
    setTimeout(() => resolve(mockConversation), 200),
  );
}

/**
 * Fetch messages for conversation
 * Replace with: const res = await fetch(`/api/jobchat/${conversationId}/messages`);
 */
async function fetchMessages(conversationId: string): Promise<Message[]> {
  // TODO: Replace with actual API call
  return new Promise((resolve) => setTimeout(() => resolve(mockMessages), 150));
}

/**
 * Send a message
 * Replace with: POST /api/jobchat/:conversationId/messages
 */
async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    senderId: CURRENT_USER_ID,
    content,
    timestamp: new Date()
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
      .replace(" ", ""),
    isRead: false,
  };
  // TODO: Replace with actual API call
  return new Promise((resolve) => setTimeout(() => resolve(newMessage), 100));
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function JobChatPage() {
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and messages
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        // In real app, get conversationId from URL params
        const conversationId = "conv-1";
        const [convData, msgData] = await Promise.all([
          fetchConversation(conversationId),
          fetchMessages(conversationId),
        ]);
        if (!mounted) return;
        setConversation(convData);
        setMessages(msgData);
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim() || !conversation) return;
    try {
      const newMsg = await sendMessage(conversation.id, inputValue.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
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
    <div className="flex-1 flex flex-col lg:flex-row bg-white h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Chat Header */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                {conversation.job.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                with {conversation.participant.name}
              </p>
            </div>
            {/* Info icon - toggles job details on mobile */}
            <button
              onClick={() => setShowJobDetails(!showJobDetails)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
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
            {/* Desktop info icon */}
            <div className="hidden lg:flex w-8 h-8 items-center justify-center rounded-full border border-gray-200 text-gray-500">
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
            </div>
          </div>
        </div>

        {/* Mobile Job Details Panel */}
        {showJobDetails && (
          <div className="lg:hidden border-b border-gray-100 bg-gray-50 p-4">
            <JobDetailsPanel
              job={conversation.job}
              onClose={() => setShowJobDetails(false)}
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
              <MessageBubble
                key={msg.id}
                message={msg}
                participant={conversation.participant}
                isOwn={msg.senderId === CURRENT_USER_ID}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - same send button as Message page */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
        >
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-3 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Job Details Sidebar */}
      <aside className="hidden lg:block w-72 xl:w-80 2xl:w-96 border-l border-gray-100 bg-white overflow-y-auto flex-shrink-0">
        <JobDetailsPanel job={conversation.job} />
      </aside>
    </div>
  );
}

// ===========================================
// SUB-COMPONENTS
// ===========================================

function MessageBubble({
  message,
  participant,
  isOwn,
}: {
  message: Message;
  participant: Participant;
  isOwn: boolean;
}) {
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
          </div>

          {/* Bubble */}
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
              isOwn
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-gray-100 text-gray-800 rounded-bl-md"
            }`}
          >
            <p className="text-xs sm:text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobDetailsPanel({
  job,
  onClose,
  isMobile = false,
}: {
  job: JobDetails;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  return (
    <div className={isMobile ? "" : "p-4 lg:p-5 xl:p-6"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
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
        {!isMobile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
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
            <p className="text-sm font-medium text-gray-900">Shedeule</p>
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
            href="#"
            className="block w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-center text-sm sm:text-base font-medium rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all"
          >
            View Full Job Posting
          </a>
        </div>
      </div>
    </div>
  );
}
