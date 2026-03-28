import { apiFetch as sharedApiFetch } from "@/lib/api";

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
  verificationStatus?: string;
  verificationNotes?: string | null;
  cv?: string | null;
  idDocument?: string | null;
  idFront?: string | null;
  idBack?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminActivity {
  initials: string;
  name: string;
  action: string;
  status: string;
  date: string;
}

export interface AdminMetrics {
  users: number;
  jobs: number;
  active_jobs: number;
  applications: number;
  payouts_completed: number;
  recent_activity?: AdminActivity[];
}

type UnknownRecord = Record<string, unknown>;

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "NA";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function normalizeActivity(item: unknown): AdminActivity {
  const record = (item && typeof item === "object" ? item : {}) as UnknownRecord;

  const name = String(record.name || record.user || "System");
  const status = String(record.status || "Success");
  const explicitAction = record.action ? String(record.action) : "";
  const type = String(record.type || "").toUpperCase();

  let action = explicitAction;
  if (!action) {
    if (type === "USER_JOINED") {
      action = "Registered new account";
    } else if (type === "JOB_CREATED") {
      action = `Created new job \"${String(record.name || "Untitled")}\"`;
    } else {
      action = "Updated platform activity";
    }
  }

  return {
    initials: String(record.initials || getInitials(name)),
    name,
    action,
    status,
    date: toIsoDate(record.date || record.createdAt),
  };
}

function normalizeMetrics(metrics: unknown): AdminMetrics {
  const record = (metrics && typeof metrics === "object" ? metrics : {}) as UnknownRecord;
  const recent = Array.isArray(record.recent_activity)
    ? record.recent_activity
    : Array.isArray(record.recentActivity)
      ? record.recentActivity
      : [];

  return {
    users: toNumber(record.users),
    jobs: toNumber(record.jobs),
    active_jobs: toNumber(record.active_jobs),
    applications: toNumber(record.applications),
    payouts_completed: toNumber(record.payouts_completed),
    recent_activity: recent.map((item) => normalizeActivity(item)),
  };
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const payload = await sharedApiFetch(path, options);
  return payload as ApiResponse<T>;
}

const ADMIN_PREFIX = "/api/admin";

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
    const response = await apiFetch<{
      metrics?: AdminMetrics;
      data?: { metrics?: AdminMetrics };
    }>(`${ADMIN_PREFIX}/metrics`);

    if (!response.success) {
      return response as ApiResponse<{ metrics: AdminMetrics }>;
    }

    const candidate =
      (response.data &&
      typeof response.data === "object" &&
      "metrics" in response.data
        ? (response.data as { metrics?: unknown }).metrics
        : undefined) ||
      (response as unknown as { metrics?: unknown }).metrics;

    if (!candidate) {
      return {
        success: false,
        error: response.error || response.message || "Invalid admin metrics response.",
      };
    }

    return {
      success: true,
      data: {
        metrics: normalizeMetrics(candidate),
      },
      message: response.message,
    };
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
