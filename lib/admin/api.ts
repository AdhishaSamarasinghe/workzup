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

export interface AdminMetrics {
  users: number;
  jobs: number;
  active_jobs: number;
  applications: number;
  payouts_completed: number;
}

export interface AdminJob {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  company?: { name: string };
  _count?: { applications: number };
}

export interface AdminApplication {
  id: string;
  status: string;
  riskLevel: string;
  riskIndicator: string;
  appliedAt: string;
  applicant?: { firstName: string; lastName: string };
  job?: { title: string; company?: { name: string } };
}

export interface AdminReport {
  id: string;
  reportedName: string;
  reason: string;
  status: string;
  priority: string;
  createdAt: string;
  reporter?: { firstName: string; lastName: string };
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

export async function getAdminMetrics(): Promise<ApiResponse<{ metrics: AdminMetrics }>> {
  try {
    return await apiFetch<{ metrics: AdminMetrics }>(`${ADMIN_PREFIX}/metrics`);
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAdminJobs(search = "", status = ""): Promise<ApiResponse<AdminJob[]>> {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const query = params.toString() ? `?${params.toString()}` : "";
    return await apiFetch<AdminJob[]>(`${ADMIN_PREFIX}/jobs${query}`);
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleJobStatus(jobId: string, status: string): Promise<ApiResponse<AdminJob>> {
  try {
    return await apiFetch<AdminJob>(`${ADMIN_PREFIX}/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAdminVerifications(status = ""): Promise<ApiResponse<AdminUser[]>> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return await apiFetch<AdminUser[]>(`${ADMIN_PREFIX}/verifications${query}`);
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateVerificationStatus(userId: string, status: string): Promise<ApiResponse<AdminUser>> {
  try {
    return await apiFetch<AdminUser>(`${ADMIN_PREFIX}/verifications/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAdminApplications(search = ""): Promise<ApiResponse<AdminApplication[]>> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return await apiFetch<AdminApplication[]>(`${ADMIN_PREFIX}/applications${query}`);
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateApplicationStatus(appId: string, status: string): Promise<ApiResponse<AdminApplication>> {
  try {
    return await apiFetch<AdminApplication>(`${ADMIN_PREFIX}/applications/${appId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAdminReports(search = ""): Promise<ApiResponse<AdminReport[]>> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return await apiFetch<AdminReport[]>(`${ADMIN_PREFIX}/reports${query}`);
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateReportStatus(reportId: string, status: string): Promise<ApiResponse<AdminReport>> {
  try {
    return await apiFetch<AdminReport>(`${ADMIN_PREFIX}/reports/${reportId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export { apiFetch };