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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const LOCAL_DEV_API_BASE_URL = "http://localhost:5000";
const PRODUCTION_EMERGENCY_API_BASE_URL = "https://workzup-production.up.railway.app";

function normalizeApiBaseUrl(rawValue: string | undefined) {
  let value = String(rawValue || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "")
    .replace(/\/$/, "");

  // Guard against accidentally pasting env assignment strings,
  // e.g. NEXT_PUBLIC_API_URL=https://api.example.com
  const assignmentMatch = value.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
  if (assignmentMatch?.[1]) {
    value = assignmentMatch[1].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  }

  if (!value) return "";

  let withProtocol = value;
  if (!/^https?:\/\//i.test(withProtocol)) {
    const lower = withProtocol.toLowerCase();
    if (lower.startsWith("localhost") || lower.startsWith("127.0.0.1")) {
      withProtocol = `http://${withProtocol}`;
    } else {
      withProtocol = `https://${withProtocol}`;
    }
  }

  return withProtocol.replace(/\/api$/i, "");
}

function normalizeApiBaseUrls(rawValue: string | undefined) {
  return String(rawValue || "")
    .split(",")
    .map((entry) => normalizeApiBaseUrl(entry))
    .filter(Boolean);
}

function isLocalhostHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isLocalhostBaseUrl(baseUrl: string | null | undefined) {
  if (!baseUrl) return false;
  try {
    const parsed = new URL(baseUrl);
    return isLocalhostHost(parsed.hostname);
  } catch {
    return false;
  }
}

function dedupeBaseUrls(urls: Array<string | null | undefined>) {
  return Array.from(new Set(urls.filter((value): value is string => Boolean(value))));
}

function resolveApiBaseUrls() {
  const configuredBases = normalizeApiBaseUrls(process.env.NEXT_PUBLIC_API_URL);
  const configuredFallbackBases = normalizeApiBaseUrls(
    process.env.NEXT_PUBLIC_API_FALLBACK_URL,
  );

  if (process.env.NODE_ENV !== "production") {
    return [LOCAL_DEV_API_BASE_URL];
  }

  const baseUrls = dedupeBaseUrls([...configuredBases, ...configuredFallbackBases]);

  // Safety net for current production setup: if custom api.workzup.lk is configured,
  // keep Railway domain as failover to avoid complete outages during DNS/SSL issues.
  const hasWorkzupCustomApi = baseUrls.some((url) => {
    try {
      return new URL(url).hostname === "api.workzup.lk";
    } catch {
      return false;
    }
  });

  if (hasWorkzupCustomApi) {
    baseUrls.push(PRODUCTION_EMERGENCY_API_BASE_URL);
  }

  return dedupeBaseUrls(baseUrls);
}

function normalizeApiPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("/api/")) {
    return normalizedPath;
  }

  // Legacy callsites still use these top-level paths; backend mounts them under /api.
  const legacyApiRoots = ["/auth", "/users", "/jobs", "/messages", "/conversations"];
  if (legacyApiRoots.some((root) => normalizedPath.startsWith(`${root}/`) || normalizedPath === root)) {
    return `/api${normalizedPath}`;
  }

  return normalizedPath;
}

export const API_BASE_URLS = resolveApiBaseUrls();
export const API_BASE_URL = API_BASE_URLS[0] || "";

// Backward-compatible alias while migrating call sites.
export const API_BASE = API_BASE_URL;

let detectedBaseUrl: string | null = null;

function getRuntimePreferredBaseUrl() {
  if (typeof window === "undefined") return null;

  const { hostname } = window.location;
  if (!isLocalhostHost(hostname)) return null;

  return LOCAL_DEV_API_BASE_URL;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function normalizeToken(raw: string | null | undefined) {
  if (!raw) return null;

  const cleaned = String(raw)
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/^"|"$/g, "")
    .trim();

  if (!cleaned || cleaned === "null" || cleaned === "undefined") {
    return null;
  }

  return cleaned;
}

function isLikelyJwt(token: string | null | undefined) {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

function clearCachedAuthTokens() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("workzup:access_token");
    window.localStorage.removeItem("token");
  } catch {
    // Ignore storage access issues.
  }
}

async function getSupabaseSessionToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return null;
    }

    const { data } = await supabase.auth.getSession();
    const supabaseToken = normalizeToken(data.session?.access_token || null);

    if (supabaseToken && isLikelyJwt(supabaseToken)) {
      try {
        window.localStorage.setItem("workzup:access_token", supabaseToken);
      } catch {
        // Ignore storage access issues.
      }
    }

    return supabaseToken && isLikelyJwt(supabaseToken) ? supabaseToken : null;
  } catch {
    return null;
  }
}

export async function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const supabaseToken = await getSupabaseSessionToken();
  if (supabaseToken) {
    return supabaseToken;
  }

  // Fallback for intermittent session hydration scenarios.
  // Only trust the Supabase-backed cache key and clear legacy token keys.
  try {
    const fallbackToken = normalizeToken(
      window.localStorage.getItem("workzup:access_token"),
    );

    // Do not use legacy custom token cache; it can hold stale non-Supabase JWTs.
    window.localStorage.removeItem("token");

    if (fallbackToken && isLikelyJwt(fallbackToken)) {
      return fallbackToken;
    }

    if (fallbackToken && !isLikelyJwt(fallbackToken)) {
      clearCachedAuthTokens();
    }
  } catch {
    // Ignore localStorage access issues.
  }

  return null;
}

export async function hasAuthenticatedUser() {
  return Boolean(await getAuthToken());
}

export async function getCurrentUserRole() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const role =
      data.user.app_metadata?.role || data.user.user_metadata?.role || null;

    return role
      ? String(role)
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, "_")
      : null;
  } catch {
    return null;
  }
}

// ============================================
// CORE FETCH ENGINE (with 5001 fallback)
// ============================================
async function executeFetch(path: string, options: RequestInit = {}) {
  if (API_BASE_URLS.length === 0) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Define it in your environment (for local dev, set it in .env.local).",
    );
  }

  const requestPath = normalizeApiPath(path);

  const performFetch = async (baseUrl: string) => {
    const url = `${baseUrl}${requestPath}`;
    const method = options.method || "GET";
    console.log(`[API] ${method} ${url}`);

    try {
      const res = await fetch(url, options);
      return res;
    } catch (error: unknown) {
      // Browsers and runtimes return different messages for network reachability failures.
      if (error instanceof TypeError) {
        throw new Error("REACHABILITY_ERROR");
      }
      throw error;
    }
  };

  const runtimePreferredBase = getRuntimePreferredBaseUrl();
  const candidateBases = [detectedBaseUrl, runtimePreferredBase, ...API_BASE_URLS].filter(
    (value, index, array): value is string => !!value && array.indexOf(value) === index,
  );

  let lastError: unknown = null;

  for (const baseUrl of candidateBases) {
    try {
      const res = await performFetch(baseUrl);
      detectedBaseUrl = baseUrl;
      return res;
    } catch (error: unknown) {
      lastError = error;
      const message = getErrorMessage(error);
      if (message !== "REACHABILITY_ERROR") {
        throw error;
      }

      if (detectedBaseUrl === baseUrl) {
        detectedBaseUrl = null;
      }
    }
  }

  const lastMessage = getErrorMessage(lastError);
  if (lastMessage === "REACHABILITY_ERROR") {
    throw new Error(
      `Backend not reachable. Checked: ${candidateBases.join(", ")}. Verify NEXT_PUBLIC_API_URL and backend availability.`,
    );
  }

  throw (lastError || new Error("Backend request failed."));
}

// ============================================
// LOW-LEVEL FETCH HELPER (auth-aware)
// ============================================
export async function apiFetch(path: string, options: RequestInit = {}) {
  const rawToken = await getAuthToken();
  const token = normalizeToken(rawToken);

  const isFormData =
    !!options.body &&
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && isLikelyJwt(token) ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res = await executeFetch(path, { ...options, headers });

  if (!res.ok && res.status === 401) {
    const authErrorData: { message?: string; error?: string } = await res
      .clone()
      .json()
      .catch(() => ({}));
    const authErrorMsg = authErrorData.message || authErrorData.error || "";
    const isTokenError = /Missing token|Invalid token/i.test(authErrorMsg);

    if (isTokenError) {
      clearCachedAuthTokens();
      const freshToken = await getSupabaseSessionToken();

      if (freshToken && freshToken !== token && isLikelyJwt(freshToken)) {
        const retryHeaders: HeadersInit = {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(options.headers || {}),
          Authorization: `Bearer ${freshToken}`,
        };

        res = await executeFetch(path, { ...options, headers: retryHeaders });
      }
    }
  }

  if (!res.ok) {
    const errorData: { message?: string; error?: string } = await res
      .json()
      .catch(() => ({}));
    const errorMsg =
      errorData.message ||
      errorData.error ||
      `Request failed with status: ${res.status}`;
    if (res.status >= 500) {
      console.error(`[API Error] ${res.status}: ${errorMsg}`);
    } else {
      console.warn(`[API Error] ${res.status}: ${errorMsg}`);
    }
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
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const data = await apiFetch(endpoint, options);
    return { success: true, data: data as T };
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
  return fetchApi<Conversation[]>("/api/conversations");
}

export async function getConversation(
  conversationId: string,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/api/conversations/${conversationId}`);
}

export async function createConversation(
  data: CreateConversationRequest,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>("/api/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function archiveConversation(
  conversationId: string,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/api/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "archive" }),
  });
}

export async function pinConversation(
  conversationId: string,
  isPinned: boolean,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/api/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "pin", isPinned }),
  });
}

export async function markConversationAsRead(
  conversationId: string,
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/api/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
}

// ============================================
// MESSAGE API
// ============================================
export async function getMessages(
  conversationId: string,
): Promise<ApiResponse<Message[]>> {
  return fetchApi<Message[]>(`/api/conversations/${conversationId}/messages`);
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  data: UpdateMessageRequest,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/api/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, conversationId }),
  });
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/api/messages/${messageId}`, {
    method: "DELETE",
    body: JSON.stringify({ conversationId }),
  });
}

export async function markMessageAsRead(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<Message>> {
  return fetchApi<Message>(`/api/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "markRead", conversationId }),
  });
}

// ============================================
// TYPING STATUS API
// ============================================
export async function updateTypingStatus(
  conversationId: string,
  isTyping: boolean,
): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/api/conversations/${conversationId}/typing`, {
    method: "POST",
    body: JSON.stringify({ isTyping }),
  });
}

export async function getTypingUsers(
  conversationId: string,
): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/api/conversations/${conversationId}/typing`);
}

// ============================================
// JOB API
// ============================================
export async function getJobDetails(
  jobId: string,
): Promise<ApiResponse<JobDetails>> {
  return fetchApi<JobDetails>(`/api/jobs/${jobId}`);
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
// PREFERENCES API
// ============================================
export async function updatePreferences(
  userId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<Record<string, unknown>>> {
  void userId;

  return fetchApi<Record<string, unknown>>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ============================================
// RECRUITER PROFILE API
// ============================================
export async function fetchRecruiter(
  recruiterId: string,
): Promise<ApiResponse<Record<string, unknown>>> {
  return fetchApi<Record<string, unknown>>(`/recruiters/${recruiterId}`);
}

export async function fetchRecruiterJobs(
  recruiterId: string,
): Promise<ApiResponse<Record<string, unknown>[]>> {
  return fetchApi<Record<string, unknown>[]>(`/recruiters/${recruiterId}/jobs`);
}

export async function fetchRecruiterReviews(
  recruiterId: string,
): Promise<ApiResponse<Record<string, unknown>[]>> {
  return fetchApi<Record<string, unknown>[]>(
    `/recruiters/${recruiterId}/reviews`,
  );
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
