"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import {
  fetchMessages,
  getCurrentMessagingUser,
  getOrCreateConversation,
  listConversations,
  markAsSeen,
  sendMessage,
} from "@/lib/messaging/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ConversationSummary,
  MessageRow,
  MessagingAudience,
  MessagingUser,
  PresenceState,
  TypingState,
} from "@/lib/messaging/types";
import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";

type ChatLayoutProps = {
  audience: MessagingAudience;
};

type TypingBroadcastPayload = {
  conversationId?: string;
  userId?: string;
  userName?: string;
  isTyping?: boolean;
};

type NewMessageBroadcastPayload = {
  message: MessageRow;
};

function upsertMessage(list: MessageRow[], incoming: MessageRow) {
  const existingIndex = list.findIndex((message) => message.id === incoming.id);

  if (existingIndex === -1) {
    return [...list, incoming].sort((a, b) => {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }

  const nextMessages = [...list];
  nextMessages[existingIndex] = incoming;
  return nextMessages;
}

function sortConversations(list: ConversationSummary[]) {
  return [...list].sort((a, b) => {
    const aTime = new Date(a.last_message_at || a.created_at).getTime();
    const bTime = new Date(b.last_message_at || b.created_at).getTime();
    return bTime - aTime;
  });
}

export default function ChatLayout({ audience }: ChatLayoutProps) {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId");
  const requestedRecipientId =
    searchParams.get("recipientId") || searchParams.get("userId");
  const requestedRecipientName = searchParams.get("recipientName");

  const [currentUser, setCurrentUser] = useState<MessagingUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(requestedConversationId);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [screenError, setScreenError] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingByConversation, setTypingByConversation] = useState<
    Record<string, TypingState>
  >({});

  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const localTypingConversationIdRef = useRef<string | null>(null);
  const localTypingActiveRef = useRef(false);
  const localTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const remoteTypingTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const selectedConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) || null
    );
  }, [conversations, selectedConversationId]);

  const fallbackConversation = useMemo<ConversationSummary | null>(() => {
    if (!selectedConversationId || selectedConversation) {
      return selectedConversation;
    }

    if (!requestedRecipientId && !requestedRecipientName) {
      return null;
    }

    return {
      id: selectedConversationId,
      user1_id: currentUser?.id || "",
      user2_id: requestedRecipientId || "",
      created_at: new Date().toISOString(),
      other_user_id: requestedRecipientId || "",
      other_user_name: requestedRecipientName || "Recruiter",
      other_user_email: null,
      other_user_avatar: null,
      last_message: null,
      last_message_at: null,
      unread_count: 0,
    };
  }, [
    currentUser?.id,
    requestedRecipientId,
    requestedRecipientName,
    selectedConversation,
    selectedConversationId,
  ]);

  const typingConversationIds = useMemo(() => {
    return Object.keys(typingByConversation);
  }, [typingByConversation]);

  const activeTypingState = useMemo(() => {
    if (!fallbackConversation) {
      return null;
    }

    return typingByConversation[fallbackConversation.id] || null;
  }, [fallbackConversation, typingByConversation]);

  const activePresence = useMemo<PresenceState>(() => {
    if (!fallbackConversation) {
      return "offline";
    }

    return onlineUserIds.includes(fallbackConversation.other_user_id)
      ? "online"
      : "offline";
  }, [fallbackConversation, onlineUserIds]);

  const loadConversations = useEffectEvent(
    async (preferredConversationId?: string | null, silent: boolean = false) => {
      if (!silent) setConversationsLoading(true);

      try {
        const nextConversations = await listConversations();
        setScreenError(null);
        setConversations(nextConversations);

        if (preferredConversationId) {
          const hasPreferredConversation = nextConversations.some(
            (conversation: ConversationSummary) =>
              conversation.id === preferredConversationId,
          );

          if (hasPreferredConversation) {
            setSelectedConversationId(preferredConversationId);
          } else if (selectedConversationId === preferredConversationId) {
            setSelectedConversationId(null);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your conversations.";
        setScreenError(message);
      } finally {
        if (!silent) setConversationsLoading(false);
      }
    },
  );

  const loadMessages = useEffectEvent(async (conversationId: string, silent: boolean = false) => {
    if (!silent) setMessagesLoading(true);

    try {
      const nextMessages = await fetchMessages(conversationId);
      setScreenError(null);
      setMessages(nextMessages);

      if (currentUser?.id) {
        await markAsSeen(conversationId, currentUser.id);
        setConversations((currentConversations) =>
          currentConversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, unread_count: 0 }
              : conversation,
          ),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load messages.";
      setScreenError(message);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  });

  const syncPresenceState = useEffectEvent(() => {
    const channel = realtimeChannelRef.current;
    if (!channel || !currentUser?.id) {
      return;
    }

    const presenceState = channel.presenceState();
    const nextOnlineUserIds = Object.keys(presenceState).filter(
      (userId) => userId && userId !== currentUser.id,
    );

    setOnlineUserIds(nextOnlineUserIds);
  });

  const clearRemoteTypingTimeout = useEffectEvent((conversationId: string) => {
    const timeout = remoteTypingTimeoutsRef.current[conversationId];
    if (timeout) {
      clearTimeout(timeout);
      delete remoteTypingTimeoutsRef.current[conversationId];
    }
  });

  const clearAllRemoteTypingTimeouts = useCallback(() => {
    const activeTimeouts = remoteTypingTimeoutsRef.current;
    Object.values(activeTimeouts).forEach((timeout) => {
      clearTimeout(timeout);
    });
    remoteTypingTimeoutsRef.current = {};
  }, []);

  const handleTypingBroadcast = useEffectEvent(
    (payload: TypingBroadcastPayload) => {
      const conversationId = String(payload.conversationId || "");
      const userId = String(payload.userId || "");

      if (!conversationId || !userId || userId === currentUser?.id) {
        return;
      }

      clearRemoteTypingTimeout(conversationId);

      if (!payload.isTyping) {
        setTypingByConversation((currentTyping) => {
          if (!currentTyping[conversationId]) {
            return currentTyping;
          }

          const nextTyping = { ...currentTyping };
          delete nextTyping[conversationId];
          return nextTyping;
        });
        return;
      }

      setTypingByConversation((currentTyping) => ({
        ...currentTyping,
        [conversationId]: {
          conversationId,
          userId,
          userName: String(payload.userName || "Someone"),
          isTyping: true,
        },
      }));

      remoteTypingTimeoutsRef.current[conversationId] = setTimeout(() => {
        setTypingByConversation((currentTyping) => {
          if (!currentTyping[conversationId]) {
            return currentTyping;
          }

          const nextTyping = { ...currentTyping };
          delete nextTyping[conversationId];
          return nextTyping;
        });
        delete remoteTypingTimeoutsRef.current[conversationId];
      }, 2500);
    },
  );

  const broadcastTypingState = useCallback(
    async (conversationId: string, isTyping: boolean) => {
      const channel = realtimeChannelRef.current;
      if (!channel || !currentUser?.id) {
        return;
      }

      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          conversationId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping,
        },
      });
    },
    [currentUser?.id, currentUser?.name],
  );

  const broadcastMessage = useCallback(
    async (message: MessageRow) => {
      const channel = realtimeChannelRef.current;
      if (!channel) return;

      try {
        await channel.send({
          type: "broadcast",
          event: "new_message",
          payload: { message },
        });
      } catch {
        // Ignore broadcast failure
      }
    },
    []
  );

  const stopLocalTyping = useCallback(async () => {
    const activeConversationId = localTypingConversationIdRef.current;

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
      localTypingTimeoutRef.current = null;
    }

    if (!activeConversationId || !localTypingActiveRef.current) {
      localTypingConversationIdRef.current = null;
      localTypingActiveRef.current = false;
      return;
    }

    localTypingConversationIdRef.current = null;
    localTypingActiveRef.current = false;

    try {
      await broadcastTypingState(activeConversationId, false);
    } catch {
      // Presence and typing should never break the core chat flow.
    }
  }, [broadcastTypingState]);

  const handleTypingActivity = useCallback(async () => {
    if (!selectedConversationId || !currentUser?.id) {
      return;
    }

    if (
      localTypingConversationIdRef.current &&
      localTypingConversationIdRef.current !== selectedConversationId
    ) {
      await stopLocalTyping();
    }

    const shouldBroadcastStart =
      !localTypingActiveRef.current ||
      localTypingConversationIdRef.current !== selectedConversationId;

    localTypingConversationIdRef.current = selectedConversationId;
    localTypingActiveRef.current = true;

    if (shouldBroadcastStart) {
      try {
        await broadcastTypingState(selectedConversationId, true);
      } catch {
        // Ignore transient typing broadcast failures.
      }
    }

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }

    localTypingTimeoutRef.current = setTimeout(() => {
      void stopLocalTyping();
    }, 1500);
  }, [broadcastTypingState, currentUser?.id, selectedConversationId, stopLocalTyping]);

  const applyIncomingMessage = useEffectEvent(
    async (payload: RealtimePostgresInsertPayload<MessageRow>) => {
      const incomingMessage = payload.new;
      if (!incomingMessage?.conversation_id) {
        return;
      }

      const isActiveConversation =
        incomingMessage.conversation_id === selectedConversationId;
      const isIncomingFromOtherUser =
        incomingMessage.sender_id !== currentUser?.id;
      const hasConversation = conversations.some(
        (conversation) => conversation.id === incomingMessage.conversation_id,
      );

      clearRemoteTypingTimeout(incomingMessage.conversation_id);
      setTypingByConversation((currentTyping) => {
        if (!currentTyping[incomingMessage.conversation_id]) {
          return currentTyping;
        }

        const nextTyping = { ...currentTyping };
        delete nextTyping[incomingMessage.conversation_id];
        return nextTyping;
      });

      setConversations((currentConversations) => {
        const conversationIndex = currentConversations.findIndex(
          (conversation) => conversation.id === incomingMessage.conversation_id,
        );

        if (conversationIndex === -1) {
          return currentConversations;
        }

        const nextConversations = [...currentConversations];
        const currentConversation = nextConversations[conversationIndex];
        nextConversations[conversationIndex] = {
          ...currentConversation,
          last_message: incomingMessage.content,
          last_message_at: incomingMessage.created_at,
          unread_count:
            isIncomingFromOtherUser && !isActiveConversation
              ? currentConversation.unread_count + 1
              : 0,
        };

        return sortConversations(nextConversations);
      });

      if (isActiveConversation) {
        setMessages((currentMessages) =>
          upsertMessage(currentMessages, incomingMessage),
        );

        if (isIncomingFromOtherUser && currentUser?.id) {
          try {
            await markAsSeen(incomingMessage.conversation_id, currentUser.id);
          } catch {
            // Keep the subscription resilient even if seen-state sync fails.
          }
        }
      } else if (!hasConversation) {
        await loadConversations(selectedConversationId);
      }
    },
  );

  const applyUpdatedMessage = useEffectEvent(
    (payload: RealtimePostgresUpdatePayload<MessageRow>) => {
      const updatedMessage = payload.new;
      if (!updatedMessage?.conversation_id) {
        return;
      }

      setMessages((currentMessages) => {
        const shouldUpdate =
          updatedMessage.conversation_id === selectedConversationId ||
          currentMessages.some((message) => message.id === updatedMessage.id);

        if (!shouldUpdate) {
          return currentMessages;
        }

        return upsertMessage(currentMessages, updatedMessage);
      });
    },
  );

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentMessagingUser();
        if (cancelled) {
          return;
        }

        setCurrentUser(user);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to read your Supabase session.";
          setScreenError(message);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    void loadConversations(requestedConversationId);
  }, [currentUser?.id, requestedConversationId]);

  useEffect(() => {
    if (
      !currentUser?.id ||
      !requestedRecipientId ||
      requestedRecipientId === currentUser.id
    ) {
      return;
    }

    let cancelled = false;

    const ensureConversation = async () => {
      try {
        const conversation = await getOrCreateConversation(
          currentUser.id,
          requestedRecipientId,
        );
        if (cancelled) {
          return;
        }

        await loadConversations(conversation.id);
        setSelectedConversationId(conversation.id);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to open that conversation.";
          setScreenError(message);
        }
      }
    };

    void ensureConversation();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, requestedRecipientId]);

  useEffect(() => {
    if (!selectedConversationId) {
      void stopLocalTyping();
      setMessages([]);
      return;
    }

    void loadMessages(selectedConversationId);

    const intervalId = setInterval(() => {
      void loadMessages(selectedConversationId, true);
      void loadConversations(selectedConversationId, true);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [selectedConversationId, stopLocalTyping]);

  useEffect(() => {
    if (
      localTypingConversationIdRef.current &&
      localTypingConversationIdRef.current !== selectedConversationId
    ) {
      void stopLocalTyping();
    }
  }, [selectedConversationId, stopLocalTyping]);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("messaging-hub", {
        config: {
          broadcast: {
            self: false,
          },
          presence: {
            key: currentUser.id,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          void applyIncomingMessage(
            payload as RealtimePostgresInsertPayload<MessageRow>,
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          applyUpdatedMessage(
            payload as RealtimePostgresUpdatePayload<MessageRow>,
          );
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        handleTypingBroadcast(payload as TypingBroadcastPayload);
      })
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        const typedPayload = payload as NewMessageBroadcastPayload;
        if (typedPayload.message) {
          void applyIncomingMessage({
            new: typedPayload.message,
          } as RealtimePostgresInsertPayload<MessageRow>);
        }
      })
      .on("presence", { event: "sync" }, () => {
        syncPresenceState();
      })
      .on("presence", { event: "join" }, () => {
        syncPresenceState();
      })
      .on("presence", { event: "leave" }, () => {
        syncPresenceState();
      });

    realtimeChannelRef.current = channel;
    const subscription = channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        syncPresenceState();
        void channel.track({
          userId: currentUser.id,
          userName: currentUser.name,
          connectedAt: new Date().toISOString(),
        });
      }
    });

    return () => {
      void stopLocalTyping();
      clearAllRemoteTypingTimeouts();
      setTypingByConversation({});
      setOnlineUserIds([]);
      realtimeChannelRef.current = null;
      void supabase.removeChannel(subscription);
    };
  }, [clearAllRemoteTypingTimeouts, currentUser?.id, currentUser?.name, stopLocalTyping]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !currentUser?.id) {
      return;
    }

    setSending(true);
    setScreenError(null);

    try {
      await stopLocalTyping();
      const insertedMessage = await sendMessage(
        selectedConversationId,
        currentUser.id,
        content,
      );
      
      await broadcastMessage(insertedMessage);

      setMessages((currentMessages) =>
        upsertMessage(currentMessages, insertedMessage),
      );
      setConversations((currentConversations) =>
        sortConversations(
          currentConversations.map((conversation) =>
            conversation.id === selectedConversationId
              ? {
                  ...conversation,
                  last_message: insertedMessage.content,
                  last_message_at: insertedMessage.created_at,
                }
              : conversation,
          ),
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send your message.";
      setScreenError(message);
      throw error;
    } finally {
      setSending(false);
    }
  };

  const pageTitle =
    audience === "JOB_SEEKER" ? "Job Seeker Messages" : "Recruiter Messages";

  if (authLoading) {
    return (
      <div className="mt-[80px] flex h-[calc(100vh-80px)] items-center justify-center bg-[#f8fafc]">
        <p className="text-sm text-slate-500">Loading messaging workspace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mt-[80px] flex h-[calc(100vh-80px)] items-center justify-center bg-[#f8fafc] px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            Supabase session required
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with your current WorkzUp account to access messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[80px] h-[calc(100vh-80px)] bg-[#f3f6fb] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,_rgba(107,139,255,0.12),_rgba(139,227,199,0.12))] px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            WorkzUp realtime chat
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {pageTitle}
          </h1>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[320px_1fr] md:grid-cols-[360px_1fr] md:grid-rows-1">
          <ConversationList
            conversations={conversations}
            loading={conversationsLoading}
            selectedConversationId={selectedConversationId}
            searchValue={searchValue}
            onlineUserIds={onlineUserIds}
            typingConversationIds={typingConversationIds}
            onSearchChange={setSearchValue}
            onSelectConversation={(conversationId) => {
              startTransition(() => {
                setSelectedConversationId(conversationId);
                setScreenError(null);
              });
            }}
          />

          <ChatWindow
            currentUserId={currentUser.id}
            conversation={fallbackConversation}
            loading={messagesLoading}
            sending={sending}
            error={screenError}
            messages={messages}
            onSendMessage={handleSendMessage}
            onTypingActivity={handleTypingActivity}
            onTypingStop={stopLocalTyping}
            presence={activePresence}
            typingName={activeTypingState?.userName || null}
          />
        </div>
      </div>
    </div>
  );
}
