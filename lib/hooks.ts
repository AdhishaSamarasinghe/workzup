"use client";

// ============================================
// CUSTOM HOOKS FOR MESSAGING
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "./api";
import { Conversation, Message, User, JobDetails } from "./types";

// Hook for managing conversations
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await api.getConversations();
    if (response.success && response.data) {
      setConversations(response.data);
    } else {
      setError(response.error || "Failed to load conversations");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const archiveConversation = async (conversationId: string) => {
    const response = await api.archiveConversation(conversationId);
    if (response.success) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    }
    return response;
  };

  const pinConversation = async (conversationId: string, isPinned: boolean) => {
    const response = await api.pinConversation(conversationId, isPinned);
    if (response.success && response.data) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? response.data! : c)),
      );
    }
    return response;
  };

  const markAsRead = async (conversationId: string) => {
    const response = await api.markConversationAsRead(conversationId);
    if (response.success && response.data) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    }
    return response;
  };

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations,
    archiveConversation,
    pinConversation,
    markAsRead,
  };
}

// Hook for managing a single conversation with messages
export function useChat(conversationId: string | null) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversation and messages
  const fetchChat = useCallback(async () => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [convResponse, msgResponse] = await Promise.all([
        api.getConversation(conversationId),
        api.getMessages(conversationId),
      ]);

      if (convResponse.success && convResponse.data) {
        setConversation(convResponse.data);
      } else {
        setError(convResponse.error || "Failed to load conversation");
      }

      if (msgResponse.success && msgResponse.data) {
        setMessages(msgResponse.data);
      }
    } catch (err) {
      setError("Failed to load chat");
    }

    setIsLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  // Send a message
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!conversationId || !content.trim()) return null;

    const response = await api.sendMessage(conversationId, {
      content: content.trim(),
      replyToId,
    });

    if (response.success && response.data) {
      setMessages((prev) => [...prev, response.data!]);
      return response.data;
    }
    return null;
  };

  // Edit a message
  const editMessage = async (messageId: string, content: string) => {
    if (!conversationId) return null;

    const response = await api.editMessage(conversationId, messageId, {
      content,
    });

    if (response.success && response.data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? response.data! : m)),
      );
      return response.data;
    }
    return null;
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!conversationId) return false;

    const response = await api.deleteMessage(conversationId, messageId);

    if (response.success) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, content: "This message was deleted" }
            : m,
        ),
      );
      return true;
    }
    return false;
  };

  // Update typing status
  const setTyping = async (isTyping: boolean) => {
    if (!conversationId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await api.updateTypingStatus(conversationId, isTyping);

    // Auto-clear typing status after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        api.updateTypingStatus(conversationId, false);
      }, 3000);
    }
  };

  // Poll for typing status (in production, use WebSockets)
  useEffect(() => {
    if (!conversationId) return;

    const pollTyping = async () => {
      const response = await api.getTypingUsers(conversationId);
      if (response.success && response.data) {
        setTypingUsers(response.data);
      }
    };

    const interval = setInterval(pollTyping, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    conversation,
    messages,
    isLoading,
    error,
    typingUsers,
    refreshChat: fetchChat,
    sendMessage,
    editMessage,
    deleteMessage,
    setTyping,
  };
}

// Hook for job details
export function useJobDetails(jobId: string | null) {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.getJobDetails(jobId);
    if (response.success && response.data) {
      setJob(response.data);
    } else {
      setError(response.error || "Failed to load job details");
    }

    setIsLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const updateJob = async (updates: Partial<JobDetails>) => {
    if (!jobId) return null;

    const response = await api.updateJobDetails(jobId, updates);
    if (response.success && response.data) {
      setJob(response.data);
      return response.data;
    }
    return null;
  };

  return {
    job,
    isLoading,
    error,
    refreshJob: fetchJob,
    updateJob,
  };
}

// Hook for message search
export function useMessageSearch() {
  const [results, setResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const search = useCallback(async (query: string, conversationId?: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    const response = await api.searchMessages(query, conversationId);
    if (response.success && response.data) {
      setResults(response.data);
    }

    setIsSearching(false);
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setSearchQuery("");
  }, []);

  return {
    results,
    isSearching,
    searchQuery,
    search,
    clearSearch,
  };
}
