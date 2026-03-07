export type ApiResponse<T> =
    | { success?: true; data?: T;[key: string]: any }
    | { success?: false; error: string;[key: string]: any }
    | T;

export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
    avatar?: string;
    role: string;
    email?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface Conversation {
    id: string;
    type: string;
    participants: User[];
    participant?: User;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    isArchived?: boolean;
    isPinned?: boolean;
    createdAt?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    text?: string;
    replyToId?: string | null;
    isRead?: boolean;
    isEdited?: boolean;
    isDeleted?: boolean;
    timestamp?: string;
    createdAt?: string;
}

export interface JobDetails {
    id: string;
    title: string;
    [key: string]: any;
}

export interface CreateConversationRequest {
    [key: string]: any;
}

export interface SendMessageRequest {
    content?: string;
    text?: string;
    [key: string]: any;
}

export interface UpdateMessageRequest {
    content?: string;
    text?: string;
    [key: string]: any;
}

export interface UpdateJobDetailsRequest {
    [key: string]: any;
}
