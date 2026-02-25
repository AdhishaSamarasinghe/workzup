"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConversationList, Conversation } from "@/components/message";

// ============================================
// TYPES
// ============================================

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

// ============================================
// MOCK DATA - Replace with API calls for backend
// ============================================

const CURRENT_USER_ID = "current-user-123";

// Mock conversations data - Replace with: GET /api/conversations
const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participant: {
      id: "user-1",
      name: "Jane Doe",
      avatar: "/avatars/jane.svg",
      role: "Urgent Warehouse Assistant",
    },
    lastMessage: "Sounds great — I'll be there.",
    lastMessageTime: "10:59 PM",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participant: {
      id: "user-2",
      name: "Mark Lee",
      avatar: "/avatars/mark.svg",
      role: "Logistics Coordinator",
    },
    lastMessage: "Can you cover the Saturday shift?",
    lastMessageTime: "9:50 PM",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participant: {
      id: "user-3",
      name: "Aisha Khan",
      avatar: "/avatars/aisha.svg",
      role: "HR Specialist",
    },
    lastMessage: "Please complete your timesheet.",
    lastMessageTime: "10:00 AM",
    unreadCount: 0,
  },
  {
    id: "conv-4",
    participant: {
      id: "user-4",
      name: "Carlos Mendez",
      avatar: "/avatars/carlos.svg",
      role: "Site Manager",
    },
    lastMessage: "",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
];

// Mock job chat conversations data
const mockJobConversations: Record<string, ChatConversation> = {
  "conv-1": {
    id: "conv-1",
    jobId: "job-1",
    participant: {
      id: "user-1",
      name: "Jane Doe",
      avatar: "/avatars/jane.svg",
      role: "Hiring Manager",
    },
    job: {
      id: "job-1",
      title: "Urgent Warehouse Assistant",
      payRate: "Rs.3000",
      location: "Colombo",
      date: "Nov 25",
      schedule: "9:00 AM - 5:00 PM",
      description:
        "We're looking for an experienced warehouse assistant to help out during a busy event.",
    },
  },
  "conv-2": {
    id: "conv-2",
    jobId: "job-2",
    participant: {
      id: "user-2",
      name: "Mark Lee",
      avatar: "/avatars/mark.svg",
      role: "Logistics Coordinator",
    },
    job: {
      id: "job-2",
      title: "Logistics Support",
      payRate: "Rs.2500",
      location: "Kandy",
      date: "Nov 28",
      schedule: "8:00 AM - 4:00 PM",
      description:
        "Support the logistics team with inventory management and shipment coordination.",
    },
  },
  "conv-3": {
    id: "conv-3",
    jobId: "job-3",
    participant: {
      id: "user-3",
      name: "Aisha Khan",
      avatar: "/avatars/aisha.svg",
      role: "HR Specialist",
    },
    job: {
      id: "job-3",
      title: "HR Administrative Assistant",
      payRate: "Rs.3500",
      location: "Colombo",
      date: "Dec 1",
      schedule: "9:00 AM - 5:00 PM",
      description:
        "Assist with HR documentation, onboarding, and employee record management.",
    },
  },
  "conv-4": {
    id: "conv-4",
    jobId: "job-4",
    participant: {
      id: "user-4",
      name: "Carlos Mendez",
      avatar: "/avatars/carlos.svg",
      role: "Site Manager",
    },
    job: {
      id: "job-4",
      title: "Site Supervision Assistant",
      payRate: "Rs.4000",
      location: "Galle",
      date: "Dec 5",
      schedule: "7:00 AM - 3:00 PM",
      description:
        "Assist with site supervision, safety compliance, and team coordination.",
    },
  },
};

// Mock messages for each conversation
const mockMessagesData: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      senderId: "user-1",
      content: "Hi — I need help with the shipment today.",
      timestamp: "10:55 PM",
      isRead: true,
    },
    {
      id: "msg-2",
      senderId: CURRENT_USER_ID,
      content: "Sure — what do you need?",
      timestamp: "10:57 PM",
      isRead: true,
    },
    {
      id: "msg-3",
      senderId: "user-1",
      content: "Sounds great — I'll be there.",
      timestamp: "10:59 PM",
      isRead: true,
    },
  ],
  "conv-2": [
    {
      id: "msg-4",
      senderId: "user-2",
      content: "Can you cover the Saturday shift?",
      timestamp: "9:45 PM",
      isRead: true,
    },
    {
      id: "msg-5",
      senderId: CURRENT_USER_ID,
      content: "Let me check my schedule and get back to you.",
      timestamp: "9:50 PM",
      isRead: true,
    },
  ],
  "conv-3": [
    {
      id: "msg-6",
      senderId: "user-3",
      content: "Please complete your timesheet.",
      timestamp: "10:00 AM",
      isRead: true,
    },
  ],
  "conv-4": [],
};

// ============================================
// API FUNCTIONS - Ready to connect to backend
// ============================================

/**
 * Fetch all conversations for the current user
 * Replace with: const response = await fetch('/api/conversations');
 */
async function fetchConversations(): Promise<Conversation[]> {
  return mockConversations;
}

/**
 * Fetch job chat conversation details
 */
async function fetchJobConversation(
  conversationId: string,
): Promise<ChatConversation | null> {
  return mockJobConversations[conversationId] || null;
}

/**
 * Fetch messages for a conversation
 */
async function fetchMessages(conversationId: string): Promise<Message[]> {
  return mockMessagesData[conversationId] || [];
}

/**
 * Send a message
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
  return newMessage;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MessagePage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Job chat preview state (for desktop)
  const [jobConversation, setJobConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle conversation selection (single click - show messages)
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // On mobile, navigate to full jobchat page (no preview available)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.push(`/jobchat?id=${conversationId}`);
    }
  };

  // Handle double click - navigate to full jobchat page
  const handleDoubleClickConversation = (conversationId: string) => {
    router.push(`/jobchat?id=${conversationId}`);
  };

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true);
      try {
        const data = await fetchConversations();
        setConversations(data);
        // Auto-select first conversation for desktop preview
        if (data.length > 0) {
          setSelectedConversationId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConversations();
  }, []);

  // Load job chat data when conversation is selected
  useEffect(() => {
    async function loadJobChat() {
      if (!selectedConversationId) {
        setJobConversation(null);
        setMessages([]);
        return;
      }
      setIsChatLoading(true);
      try {
        const [convData, msgData] = await Promise.all([
          fetchJobConversation(selectedConversationId),
          fetchMessages(selectedConversationId),
        ]);
        setJobConversation(convData);
        setMessages(msgData);
      } catch (error) {
        console.error("Failed to load job chat:", error);
      } finally {
        setIsChatLoading(false);
      }
    }
    loadJobChat();
  }, [selectedConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim() || !jobConversation) return;
    try {
      const newMsg = await sendMessage(jobConversation.id, inputValue.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Navigate to full jobchat page
  const handleOpenFullChat = () => {
    if (selectedConversationId) {
      router.push(`/jobchat?id=${selectedConversationId}`);
    }
  };

  if (isLoading) {
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
            conversations={conversations}
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
                      {jobConversation.job.title}
                    </h1>
                    <p className="text-sm text-gray-500 truncate">
                      with {jobConversation.participant.name}
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
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        participant={jobConversation.participant}
                        isOwn={msg.senderId === CURRENT_USER_ID}
                      />
                    ))}
                    <div ref={messagesEndRef} />
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
                    onChange={(e) => setInputValue(e.target.value)}
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
    </>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

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
        className={`flex items-end gap-2 max-w-[85%] ${
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
          </div>

          {/* Bubble */}
          <div
            className={`px-3 py-2 rounded-2xl ${
              isOwn
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-gray-100 text-gray-800 rounded-bl-md"
            }`}
          >
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
