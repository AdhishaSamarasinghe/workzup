export type MessagingAudience = "JOB_SEEKER" | "RECRUITER";

export type MessagingUser = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: string | null;
};

export type PresenceState = "online" | "offline";

export type TypingState = {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
};

export type MessageDeliveryStatus = "delivered" | "seen";

export type ConversationRow = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export type ConversationSummary = ConversationRow & {
  other_user_id: string;
  other_user_name: string;
  other_user_email: string | null;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_seen: boolean;
};
