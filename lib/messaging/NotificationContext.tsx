"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentMessagingUser, listConversations } from "./api";
import type { MessageRow, ConversationSummary } from "./types";
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
  const conversationsRef = useRef<ConversationSummary[]>([]);
  const router = useRouter();

  const refreshUnreadCount = useCallback(async () => {
    try {
      const user = await getCurrentMessagingUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }
      const conversations = await listConversations();
      conversationsRef.current = conversations;
      
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

      const handleIncoming = async (incomingMessage: MessageRow) => {
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
          // Find sender details
          let conversation = conversationsRef.current.find(c => c.id === incomingMessage.conversation_id);
          
          // If conversation isn't in cache (e.g. brand new conversation), force refresh
          if (!conversation) {
             await refreshUnreadCount();
             conversation = conversationsRef.current.find(c => c.id === incomingMessage.conversation_id);
          }

          // If STILL not found, this message is not for us! (Supabase postgres_changes might broadcast to all if RLS isn't strict)
          if (!conversation) return;

          setUnreadCount((prev) => prev + 1);

          const senderName = conversation?.other_user_name || "Someone";
          const senderAvatar = conversation?.other_user_avatar;
          
          const normalizeRole = (r?: string) => String(r || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
          const role = normalizeRole(user.role || "");
          const isRecruiter = role === "RECRUITER" || role === "EMPLOYER";
          
          const dashboardUrl = isRecruiter
            ? `/recruiter/messages?conversationId=${incomingMessage.conversation_id}`
            : `/jobseeker/messages?conversationId=${incomingMessage.conversation_id}`;

          // Play sound
          try {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
          } catch {
            // Ignore audio errors
          }

          // Show Professional React Hot Toast
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer transform transition-all hover:scale-[1.02]`}
              onClick={() => {
                toast.dismiss(t.id);
                router.push(dashboardUrl);
              }}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {senderAvatar ? (
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={senderAvatar}
                        alt={senderName}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Message from {senderName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {incomingMessage.content}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 5000, position: "bottom-right" });

          // Show Browser Notification if hidden
          if (
            typeof document !== "undefined" &&
            document.hidden &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const browserNotification = new Notification(`Message from ${senderName}`, {
              body: incomingMessage.content,
              icon: senderAvatar || "/logo_icon.png"
            });
            
            browserNotification.onclick = () => {
              window.focus();
              router.push(dashboardUrl);
              browserNotification.close();
            };
          }
        }
      };

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
            void handleIncoming(payload.new);
          }
        )
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          if (payload && payload.message) {
            void handleIncoming(payload.message as MessageRow);
          }
        })
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
  }, [router, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, decrementUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
