"use client";

import { useState, useEffect } from "react";
import {
  ConversationList,
  ChatWindow,
  Conversation,
  Message,
} from "@/components/message";

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

// Mock messages data - Replace with: GET /api/conversations/:id/messages
const mockMessages: Record<string, Message[]> = {
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
      timestamp: "10:59 PM",
      isRead: true,
    },
  ],
  "conv-2": [
    {
      id: "msg-3",
      senderId: "user-2",
      content: "Can you cover the Saturday shift?",
      timestamp: "9:45 PM",
      isRead: false,
    },
  ],
  "conv-3": [
    {
      id: "msg-4",
      senderId: "user-3",
      content: "Reminder: please complete your timesheet before Friday.",
      timestamp: "9:00 AM",
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
  // TODO: Replace with actual API call
  // const response = await fetch('/api/conversations');
  // return response.json();
  return mockConversations;
}

/**
 * Fetch messages for a specific conversation
 * Replace with: const response = await fetch(`/api/conversations/${conversationId}/messages`);
 */
async function fetchMessages(conversationId: string): Promise<Message[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/conversations/${conversationId}/messages`);
  // return response.json();
  return mockMessages[conversationId] || [];
}

/**
 * Send a new message
 * Replace with: const response = await fetch('/api/messages', { method: 'POST', body: ... });
 */
async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/messages', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ conversationId, content }),
  // });
  // return response.json();

  // Mock response
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Handle conversation selection (with mobile view switch)
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatOnMobile(true);
  };

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true);
      try {
        const data = await fetchConversations();
        setConversations(data);
        // Auto-select first conversation
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

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }
      try {
        const data = await fetchMessages(selectedConversationId);
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    }
    loadMessages();
  }, [selectedConversationId]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      const newMessage = await sendMessage(selectedConversationId, content);
      setMessages((prev) => [...prev, newMessage]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                lastMessage: content,
                lastMessageTime: newMessage.timestamp,
              }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Get selected conversation
  const selectedConversation =
    conversations.find((conv) => conv.id === selectedConversationId) || null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Conversation List - hidden on mobile when chat is open */}
      <div
        className={`${showChatOnMobile ? "hidden" : "flex"} md:flex w-full md:w-auto`}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isMobileView={true}
        />
      </div>

      {/* Chat Window - shown on mobile when chat is open, always on desktop */}
      <div
        className={`${showChatOnMobile ? "flex" : "hidden"} md:flex flex-1 w-full md:w-auto`}
      >
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          currentUserId={CURRENT_USER_ID}
          onSendMessage={handleSendMessage}
          onBack={handleBackToList}
          isMobileView={showChatOnMobile}
        />
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
