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
    } catch (error: any) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("REACHABILITY_ERROR");
      }
      throw error;
    }
  };

  if (detectedBaseUrl) {
    try {
      return await performFetch(detectedBaseUrl);
    } catch (e: any) {
      if (e.message !== "REACHABILITY_ERROR") throw e;
      detectedBaseUrl = null;
    }
  }

  try {
    const res = await performFetch(API_BASE);
    detectedBaseUrl = API_BASE;
    return res;
  } catch (error: any) {
    if (error.message === "REACHABILITY_ERROR") {
      const isDev = process.env.NODE_ENV === "development";
      if (isDev && API_BASE.includes("localhost:5000")) {
        const fallbackUrl = API_BASE.replace("5000", "5001");
        console.warn(`[API] Localhost:5000 unreachable. Detecting if backend is on 5001...`);
        try {
          const healthRes = await fetch(`${fallbackUrl}/health`);
          if (healthRes.ok) {
            console.log(`[API] Backend detected on ${fallbackUrl}. Caching for future calls.`);
            detectedBaseUrl = fallbackUrl;
            return await performFetch(fallbackUrl);
          }
        } catch (healthError) { }
      }
      throw new Error("Backend not reachable. Check if server is running on port 5000 or 5001.");
    }
    throw error;
  }
}

// ============================================
// LOW-LEVEL FETCH HELPER (auth-aware)
// Used by auth/onboarding/recruiter flows and preferences profiles
// ============================================

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = !!(options.body && typeof FormData !== 'undefined' && options.body instanceof FormData);
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  } as HeadersInit;

  const res = await executeFetch(path, { ...options, headers });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ============================================
// PREFERENCES & RECRUITER API
// ============================================

export const fetchPreferences = (userId: string) =>
  apiFetch(`/preferences/${userId}`);
export const updatePreferences = (userId: string, data: any) =>
  apiFetch(`/preferences/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const fetchRecruiter = (id: string) => apiFetch(`/recruiters/${id}`);
export const fetchRecruiterJobs = (id: string) =>
  apiFetch(`/recruiters/${id}/jobs`);
export const fetchRecruiterReviews = (id: string) =>
  apiFetch(`/recruiters/${id}/reviews`);
export const contactRecruiter = (id: string, body?: object) =>
  apiFetch(`/recruiters/${id}/contact`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });


// ============================================
// LOW-LEVEL FETCH HELPER (generic, typed)
// Used by messaging/conversation/job flows
// ============================================

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await executeFetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("API Error Response:", text);
      throw new Error(`API request failed with status: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error("Server returned non-JSON response: " + text);
    }

    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
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
  return fetchApi<Message[]>(`/messages?conversationId=${conversationId}`);
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/messages`, {
    method: "POST",
    body: JSON.stringify({ ...data, conversationId }),
  });
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  data: UpdateMessageRequest,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(
    `/messages/${messageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ ...data, conversationId }),
    },
  );
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<null>> {
  return fetchApi<null>(
    `/messages/${messageId}`,
    {
      method: "DELETE",
      body: JSON.stringify({ conversationId })
    },
  );
}

export async function markMessageAsRead(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(
    `/messages/${messageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action: "markRead", conversationId }),
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
