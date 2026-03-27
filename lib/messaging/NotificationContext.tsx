"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentMessagingUser, listConversations } from "./api";
import type { MessageRow } from "./types";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: (amount?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useMessageNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useMessageNotification must be used within a MessageNotificationProvider");
  }
  return context;
}

export function MessageNotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const activeConversationIdRef = useRef<string | null>(null);
  const handledMessagesRef = useRef<Set<string>>(new Set());

  const refreshUnreadCount = useCallback(async () => {
    try {
      const user = await getCurrentMessagingUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }
      const conversations = await listConversations();
      const totalUnread = conversations.reduce(
        (count, conversation) => count + conversation.unread_count,
        0
      );
      setUnreadCount(totalUnread);
    } catch (error) {
      console.warn("Failed to fetch unread count", error);
    }
  }, []);

  const decrementUnreadCount = useCallback((amount = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  // Listen to custom window event to track currently active conversation UI
  useEffect(() => {
    const handleActiveConversation = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      activeConversationIdRef.current = customEvent.detail;
      
      // If we just opened a conversation, some messages might have been read.
      // Easiest way to sync is to refresh count.
      if (customEvent.detail) {
        // Slight delay to allow actual DB mark-as-read to process (which ChatLayout does).
        setTimeout(refreshUnreadCount, 500);
      }
    };

    window.addEventListener("chat:active_conversation", handleActiveConversation);
    return () => {
      window.removeEventListener("chat:active_conversation", handleActiveConversation);
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    let mounted = true;

    const initRealtime = async () => {
      const user = await getCurrentMessagingUser();
      if (!user || !mounted) return;

      // Ask for browser notification permission
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      await refreshUnreadCount();

      const supabase = getSupabaseBrowserClient();
      if (!supabase || !mounted) return;

      const channel = supabase
        .channel("global-message-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload: RealtimePostgresInsertPayload<MessageRow>) => {
            const incomingMessage = payload.new;

            if (incomingMessage.sender_id === user.id) return; // Don't notify for our own messages

            if (handledMessagesRef.current.has(incomingMessage.id)) {
              return; // Prevent duplicates
            }
            handledMessagesRef.current.add(incomingMessage.id);

            const isCurrentlyActive =
              activeConversationIdRef.current === incomingMessage.conversation_id &&
              typeof document !== "undefined" &&
              !document.hidden;

            if (!isCurrentlyActive) {
              setUnreadCount((prev) => prev + 1);

              // Play sound
              try {
                const audio = new Audio("/notification.mp3");
                audio.play().catch((err) => console.warn("Failed to play notification audio", err));
              } catch (err) {
                // Ignore audio errors
              }

              // Show React Hot Toast
              toast(`New message: ${incomingMessage.content.slice(0, 40)}${incomingMessage.content.length > 40 ? "..." : ""}`, {
                icon: "💬",
                duration: 5000,
                position: "bottom-right",
              });

              // Show Browser Notification if hidden
              if (
                typeof document !== "undefined" &&
                document.hidden &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification(`New message`, {
                  body: incomingMessage.content,
                  icon: "/logo_icon.png" // assuming standard icon exists
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = initRealtime();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, decrementUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
