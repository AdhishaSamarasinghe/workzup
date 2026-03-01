// ============================================
// API SERVICE - Frontend API calls
// ============================================

import {
  ApiResponse,
  Conversation,
  Message,
  JobDetails,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  UpdateJobDetailsRequest,
  User,
} from "./types";

const API_BASE = "/api";

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: "Network error" };
  }
}

// ============================================
// CONVERSATION API
// ============================================

export async function getConversations(): Promise<ApiResponse<Conversation[]>> {
  return fetchApi<Conversation[]>("/conversations");
}

export async function getConversation(
  conversationId: string,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`);
}

export async function createConversation(
  data: CreateConversationRequest,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function archiveConversation(
  conversationId: string,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "archive" }),
  });
}

export async function pinConversation(
  conversationId: string,
  isPinned: boolean,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "pin", isPinned }),
  });
}

export async function markConversationAsRead(
  conversationId: string,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "markRead" }),
  });
}

// ============================================
// MESSAGE API
// ============================================

export async function getMessages(
  conversationId: string,
): Promise<ApiResponse<Message[]>> {
  return fetchApi<Message[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  data: UpdateMessageRequest,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(
    `/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<null>> {
  return fetchApi<null>(
    `/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "DELETE",
    },
  );
}

export async function markMessageAsRead(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(
    `/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action: "markRead" }),
    },
  );
}

// ============================================
// TYPING STATUS API
// ============================================

export async function updateTypingStatus(
  conversationId: string,
  isTyping: boolean,
): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/conversations/${conversationId}/typing`, {
    method: "POST",
    body: JSON.stringify({ isTyping }),
  });
}

export async function getTypingUsers(
  conversationId: string,
): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/conversations/${conversationId}/typing`);
}

// ============================================
// JOB API
// ============================================

export async function getJobDetails(
  jobId: string,
): Promise<ApiResponse<JobDetails>> {
  return fetchApi<JobDetails>(`/jobs/${jobId}`);
}

export async function updateJobDetails(
  jobId: string,
  data: UpdateJobDetailsRequest,
): Promise<ApiResponse<JobDetails>> {
  return fetchApi<JobDetails>(`/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================
// SEARCH API
// ============================================

export async function searchMessages(
  query: string,
  conversationId?: string,
): Promise<ApiResponse<Message[]>> {
  const params = new URLSearchParams({ q: query });
  if (conversationId) {
    params.append("conversationId", conversationId);
  }
  return fetchApi<Message[]>(`/messages/search?${params.toString()}`);
}
