import { API_BASE } from "@/lib/api";

export function resolveUploadUrl(pathValue?: string | null) {
  if (!pathValue) return null;
  if (/^https?:\/\//i.test(pathValue)) return pathValue;
  if (pathValue.startsWith("/")) return pathValue;
  const normalized = pathValue.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_BASE}/${normalized}`;
}

export function isGeneratedAvatar(pathValue?: string | null) {
  if (!pathValue) return true;
  return pathValue.includes("ui-avatars.com") || pathValue.includes("/avatars/default.svg");
}

export function resolveProfileAvatar(pathValue?: string | null) {
  const resolved = resolveUploadUrl(pathValue) || pathValue || null;
  return resolved && !isGeneratedAvatar(resolved) ? resolved : null;
}

export function getNameInitials(name?: string | null) {
  const normalized = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (normalized.length === 0) return "JS";
  if (normalized.length === 1) return normalized[0].slice(0, 2).toUpperCase();
  return `${normalized[0][0] || ""}${normalized[1][0] || ""}`.toUpperCase();
}
