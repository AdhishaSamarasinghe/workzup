"use client";

import { apiFetch } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function requireSupabaseClient() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase browser auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return supabase;
}

export async function migrateLegacyUserToSupabase(
  email: string,
  password: string,
  expectedRole: string,
) {
  return apiFetch("/api/auth/migrate-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      expectedRole,
    }),
  });
}

export async function signInWithSupabasePassword(email: string, password: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function startSupabaseOAuth(role: string, provider: "google" | "facebook" | "linkedin_oidc") {
  if (typeof window !== "undefined") {
    localStorage.setItem("workzup:oauth-role", role);
  }

  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/oauth-complete`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function syncOAuthSession(role: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("Supabase OAuth session was not created.");
  }

  const response = await fetch("/api/auth/oauth-sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ role }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Failed to sync your social login.");
  }

  return payload;
}

export async function signOutWorkzupAuth() {
  const supabase = requireSupabaseClient();
  await supabase.auth.signOut();
}
