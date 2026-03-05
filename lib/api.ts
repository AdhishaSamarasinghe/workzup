export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let detectedBaseUrl: string | null = null;

export async function fetchApi(path: string, options: RequestInit = {}) {
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL is missing. Check your .env.local file and restart Next.js.",
    );
  }

  const performFetch = async (baseUrl: string) => {
    const url = `${baseUrl}${path}`;
    const method = options.method || "GET";
    console.log(`[API] ${method} ${url}`);

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `[API Error Response] Status: ${res.status}, Body: ${errorText}`,
        );
        throw new Error(
          `API request failed with status ${res.status}: ${errorText}`,
        );
      }

      return await res.json();
    } catch (error: any) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("REACHABILITY_ERROR");
      }
      throw error;
    }
  };

  // Try using the previously detected URL if available
  if (detectedBaseUrl) {
    try {
      return await performFetch(detectedBaseUrl);
    } catch (e: any) {
      if (e.message !== "REACHABILITY_ERROR") throw e;
      detectedBaseUrl = null; // Reset if detected URL is no longer valid
    }
  }

  try {
    const result = await performFetch(BASE_URL);
    detectedBaseUrl = BASE_URL; // Success on original URL
    return result;
  } catch (error: any) {
    if (error.message === "REACHABILITY_ERROR") {
      // Auto-detection logic (Development fallback)
      const isDev = process.env.NODE_ENV === "development";
      if (isDev && BASE_URL.includes("localhost:5000")) {
        const fallbackUrl = BASE_URL.replace("5000", "5001");
        console.warn(
          `[API] Localhost:5000 unreachable. Detecting if backend is on 5001...`,
        );

        try {
          const healthRes = await fetch(`${fallbackUrl}/health`);
          if (healthRes.ok) {
            console.log(
              `[API] Backend detected on ${fallbackUrl}. Caching for future calls.`,
            );
            detectedBaseUrl = fallbackUrl;
            return await performFetch(fallbackUrl);
          }
        } catch (healthError) {
          // Fallback also failed
        }
      }
      throw new Error(
        "Backend not reachable. Check if server is running on port 5000 or 5001.",
      );
    }
    throw error;
  }
}

export const fetchPreferences = (userId: string) =>
  fetchApi(`/preferences/${userId}`);
export const updatePreferences = (userId: string, data: any) =>
  fetchApi(`/preferences/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const fetchRecruiter = (id: string) => fetchApi(`/recruiters/${id}`);
export const fetchRecruiterJobs = (id: string) =>
  fetchApi(`/recruiters/${id}/jobs`);
export const fetchRecruiterReviews = (id: string) =>
  fetchApi(`/recruiters/${id}/reviews`);
export const contactRecruiter = (id: string, body?: object) =>
  fetchApi(`/recruiters/${id}/contact`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
