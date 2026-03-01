// ============================================
// SHARED TYPES FOR BACKEND AND FRONTEND
// ============================================

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string;
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
  payRate: string;
  location: string;
  date: string;
  schedule: string;
  description: string;
  status: "open" | "filled" | "closed";
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "job";
  participants: User[];
  jobId?: string;
  job?: JobDetails;
  lastMessage?: Message;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt?: string;
  isArchived: boolean;
  isPinned: boolean;
}

// API Request/Response types
export interface SendMessageRequest {
  content: string;
  replyToId?: string;
  attachments?: Attachment[];
}

export interface UpdateMessageRequest {
  content: string;
}

export interface UpdateJobDetailsRequest {
  title?: string;
  payRate?: string;
  location?: string;
  date?: string;
  schedule?: string;
  description?: string;
  status?: "open" | "filled" | "closed";
}

export interface CreateConversationRequest {
  participantIds: string[];
  type: "direct" | "job";
  jobId?: string;
  initialMessage?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
