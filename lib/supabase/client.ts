"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let hasWarnedMissingEnv = false;

function getBrowserSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    if (!hasWarnedMissingEnv && typeof window !== "undefined") {
      console.warn(
        "Supabase browser auth is disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      hasWarnedMissingEnv = true;
    }

    return null;
  }

  return { url, anonKey };
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const env = getBrowserSupabaseEnv();
  if (!env) {
    return null;
  }

  browserClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

export function isSupabaseBrowserConfigured() {
  return Boolean(getBrowserSupabaseEnv());
}
