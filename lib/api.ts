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

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

let detectedBaseUrl: string | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// ============================================
// CORE FETCH ENGINE (with 5001 fallback)
// ============================================
async function executeFetch(path: string, options: RequestInit = {}) {
  const performFetch = async (baseUrl: string) => {
    const url = `${baseUrl}${path}`;
    const method = options.method || "GET";
    console.log(`[API] ${method} ${url}`);

    try {
      const res = await fetch(url, options);
      return res;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (error instanceof TypeError && message === "Failed to fetch") {
        throw new Error("REACHABILITY_ERROR");
      }
      throw error;
    }
  };

  if (detectedBaseUrl) {
    try {
      return await performFetch(detectedBaseUrl);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (message !== "REACHABILITY_ERROR") throw error;
      detectedBaseUrl = null;
    }
  }

  try {
    const res = await performFetch(API_BASE);
    detectedBaseUrl = API_BASE;
    return res;
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "REACHABILITY_ERROR") {
      const isDev = process.env.NODE_ENV === "development";

      if (isDev && API_BASE.includes("localhost:5000")) {
        const fallbackUrl = API_BASE.replace("5000", "5001");
        console.warn(
          "[API] Localhost:5000 unreachable. Detecting if backend is on 5001..."
        );

        try {
          const healthRes = await fetch(`${fallbackUrl}/health`);
          if (healthRes.ok) {
            console.log(
              `[API] Backend detected on ${fallbackUrl}. Caching for future calls.`
            );
            detectedBaseUrl = fallbackUrl;
            return await performFetch(fallbackUrl);
          }
        } catch {
          // ignore fallback health check failure
        }
      }

      throw new Error(
        "Backend not reachable. Check if server is running on port 5000 or 5001."
      );
    }

    throw error;
  }
}

// ============================================
// LOW-LEVEL FETCH HELPER (auth-aware)
// ============================================

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData =
    !!options.body &&
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await executeFetch(path, { ...options, headers });

  if (!res.ok) {
    const errorData: { message?: string } = await res.json().catch(() => ({}));
    const errorMsg =
      errorData.message || `Request failed with status: ${res.status}`;
    console.error(`[API Error] ${res.status}: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }

  return await res.text();
}

/**
 * @deprecated Use apiFetch instead for consistency.
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const data = await apiFetch(endpoint, options);
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || "Network error",
    };
  }
}

// ============================================
// CONVERSATION API
// ============================================

export async function getConversations(): Promise<ApiResponse<Conversation[]>> {
  return fetchApi<Conversation[]>("/conversations");
}

export async function getConversation(
  conversationId: string
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`);
}

export async function createConversation(
  data: CreateConversationRequest
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function archiveConversation(
  conversationId: string
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "archive" }),
  });
}

export async function pinConversation(
  conversationId: string,
  isPinned: boolean
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "pin", isPinned }),
  });
}

export async function markConversationAsRead(
  conversationId: string
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
  conversationId: string
): Promise<ApiResponse<Message[]>> {
  return fetchApi<Message[]>(`/messages?conversationId=${conversationId}`);
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/messages`, {
    method: "POST",
    body: JSON.stringify({ ...data, conversationId }),
  });
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  data: UpdateMessageRequest
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, conversationId }),
  });
}

export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/messages/${messageId}`, {
    method: "DELETE",
    body: JSON.stringify({ conversationId }),
  });
}

export async function markMessageAsRead(
  conversationId: string,
  messageId: string
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "markRead", conversationId }),
  });
}

// ============================================
// TYPING STATUS API
// ============================================

export async function updateTypingStatus(
  conversationId: string,
  isTyping: boolean
): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/conversations/${conversationId}/typing`, {
    method: "POST",
    body: JSON.stringify({ isTyping }),
  });
}

export async function getTypingUsers(
  conversationId: string
): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/conversations/${conversationId}/typing`);
}

// ============================================
// JOB API
// ============================================

export async function getJobDetails(
  jobId: string
): Promise<ApiResponse<JobDetails>> {
  return fetchApi<JobDetails>(`/jobs/${jobId}`);
}

export async function updateJobDetails(
  jobId: string,
  data: UpdateJobDetailsRequest
): Promise<ApiResponse<JobDetails>> {
  return fetchApi<JobDetails>(`/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================
// PREFERENCES API
// ============================================

export async function updatePreferences(
  userId: string,
  data: any,
): Promise<ApiResponse<any>> {
  // Currently mapping preferences to the profile update endpoint
  return fetchApi<any>(`/auth/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ============================================
// SEARCH API
// ============================================

export async function searchMessages(
  query: string,
  conversationId?: string
): Promise<ApiResponse<Message[]>> {
  const params = new URLSearchParams({ q: query });
  if (conversationId) {
    params.append("conversationId", conversationId);
  }
  return fetchApi<Message[]>(`/messages/search?${params.toString()}`);
}