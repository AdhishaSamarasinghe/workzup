import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export interface AdminUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(
      "Supabase browser client is not configured. Check .env.local."
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.access_token) {
    throw new Error("No active Supabase session found");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload: ApiResponse<T> | null = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed with status ${response.status}`
    );
  }

  return payload || { success: false, error: "Empty response from server" };
}

const ADMIN_PREFIX = "/admin";

export async function getAdminUsers(
  search = ""
): Promise<ApiResponse<AdminUser[]>> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return await apiFetch<AdminUser[]>(`${ADMIN_PREFIX}/users${query}`);
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function toggleUserBanStatus(
  userId: string,
  isBanned: boolean
): Promise<ApiResponse<AdminUser>> {
  try {
    return await apiFetch<AdminUser>(`${ADMIN_PREFIX}/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ isBanned }),
    });
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export { apiFetch };