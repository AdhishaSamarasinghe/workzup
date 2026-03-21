// ============================================
// SHARED TYPES FOR BACKEND AND FRONTEND
// ============================================

export type ApiResponse<T> =
  | { success: boolean; data?: T; error?: string; message?: string;[key: string]: unknown };

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  text?: string;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string | null;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: "image" | "file" | "audio";
  url: string;
  name: string;
  size?: number;
}

export interface JobDetails {
  id: string;
  title: string;
  payRate?: string;
  location?: string;
  date?: string;
  schedule?: string;
  description?: string;
  status?: "open" | "filled" | "closed";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  type: "direct" | "job";
  participants: User[];
  participant?: User;
  jobId?: string;
  job?: JobDetails;
  lastMessage?: string | Message;
  lastMessageTime?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
  isPinned?: boolean;
}

// API Request/Response types
export interface SendMessageRequest {
  content?: string;
  text?: string;
  replyToId?: string;
  attachments?: Attachment[];
  [key: string]: unknown;
}

export interface UpdateMessageRequest {
  content?: string;
  text?: string;
  [key: string]: unknown;
}

export interface UpdateJobDetailsRequest {
  title?: string;
  payRate?: string;
  location?: string;
  date?: string;
  schedule?: string;
  description?: string;
  status?: "open" | "filled" | "closed";
  [key: string]: unknown;
}

export interface CreateConversationRequest {
  participantIds?: string[];
  type?: "direct" | "job";
  jobId?: string;
  initialMessage?: string;
  [key: string]: unknown;
}

// Typing indicator
export interface TypingStatus {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

// Read receipt
export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}
