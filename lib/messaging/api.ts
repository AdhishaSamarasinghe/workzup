"use client";

import { apiFetch } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ConversationRow, ConversationSummary, MessageRow, MessagingUser } from "./types";

function normalizeConversationSummary(row: Record<string, unknown>): ConversationSummary {
  return {
    id: String(row.id),
    user1_id: String(row.user1_id),
    user2_id: String(row.user2_id),
    created_at: String(row.created_at),
    other_user_id: String(row.other_user_id),
    other_user_name: String(row.other_user_name || "Unknown user"),
    other_user_email: row.other_user_email ? String(row.other_user_email) : null,
    other_user_avatar: row.other_user_avatar ? String(row.other_user_avatar) : null,
    last_message: row.last_message ? String(row.last_message) : null,
    last_message_at: row.last_message_at ? String(row.last_message_at) : null,
    unread_count: Number(row.unread_count || 0),
  };
}

function normalizeUserMetadata(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): MessagingUser {
  const metadata = user.user_metadata || {};
  const fullName = [metadata.first_name, metadata.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: user.id,
    name:
      fullName ||
      String(metadata.full_name || metadata.name || metadata.company_name || user.email || "User"),
    email: user.email || null,
    avatarUrl: metadata.avatar_url
      ? String(metadata.avatar_url)
      : metadata.picture
        ? String(metadata.picture)
        : null,
    role: user.app_metadata?.role
      ? String(user.app_metadata.role)
      : metadata.role
        ? String(metadata.role)
        : null,
  };
}

export async function getCurrentMessagingUser() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    return null;
  }

  return normalizeUserMetadata(data.user);
}

export async function listConversations() {
  const data = await apiFetch("/api/messaging/conversations");
  return (Array.isArray(data) ? data : []).map((row: unknown) =>
    normalizeConversationSummary(row as Record<string, unknown>),
  );
}

export async function getOrCreateConversation(userA: string, userB: string) {
  void userA;
  const data = await apiFetch("/api/messaging/conversations", {
    method: "POST",
    body: JSON.stringify({
      recipientId: userB,
    }),
  });

  return data as ConversationRow;
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message cannot be empty.");
  }

  void senderId;
  const data = await apiFetch(`/api/messaging/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: trimmedContent,
    }),
  });
  return data as MessageRow;
}

export async function fetchMessages(conversationId: string) {
  const data = await apiFetch(`/api/messaging/conversations/${conversationId}/messages`);
  return (Array.isArray(data) ? data : []) as MessageRow[];
}

export async function markAsSeen(conversationId: string, currentUser: string) {
  void currentUser;
  await apiFetch(`/api/messaging/conversations/${conversationId}/seen`, {
    method: "PATCH",
  });
}
