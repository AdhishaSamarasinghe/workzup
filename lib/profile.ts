import { API_BASE_URL } from "@/lib/api";

export function resolveUploadUrl(pathValue?: string | null) {
  if (!pathValue) return null;

  const normalizeRelativeUploadPath = (value: string) => {
    const normalized = value.replace(/\\/g, "/").trim();
    const noLeadingSlash = normalized.replace(/^\/+/, "");

    if (noLeadingSlash.startsWith("api/uploads/")) {
      return `/${noLeadingSlash}`;
    }

    if (noLeadingSlash.startsWith("uploads/")) {
      return `/api/${noLeadingSlash}`;
    }

    const uploadsToken = "/uploads/";
    const tokenIndex = noLeadingSlash.indexOf(uploadsToken);
    if (tokenIndex >= 0) {
      const uploadRelative = noLeadingSlash.slice(tokenIndex + 1);
      return `/api/${uploadRelative}`;
    }

    if (!noLeadingSlash.includes("/")) {
      return `/api/uploads/${noLeadingSlash}`;
    }

    return `${API_BASE_URL}/${noLeadingSlash}`;
  };

  if (/^https?:\/\//i.test(pathValue)) {
    try {
      const parsed = new URL(pathValue);
      return normalizeRelativeUploadPath(parsed.pathname);
    } catch {
      return pathValue;
    }
  }

  if (pathValue.startsWith("/")) {
    return normalizeRelativeUploadPath(pathValue);
  }

  return normalizeRelativeUploadPath(pathValue);
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
