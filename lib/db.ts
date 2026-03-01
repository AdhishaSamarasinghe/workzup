// ============================================
// IN-MEMORY DATABASE (Replace with real DB)
// This simulates a database for development
// Replace with Prisma, MongoDB, PostgreSQL, etc.
// ============================================

import { User, Message, Conversation, JobDetails, TypingStatus } from "./types";

// Current User ID (would come from authentication)
export const CURRENT_USER_ID = "current-user-123";

// ============================================
// USERS DATA
// ============================================
const users: Map<string, User> = new Map([
  [
    "current-user-123",
    {
      id: "current-user-123",
      name: "You",
      email: "user@workzup.com",
      avatar: "/avatars/default.svg",
      role: "Job Seeker",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
  ],
  [
    "user-1",
    {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@workzup.com",
      avatar: "/avatars/jane.svg",
      role: "Hiring Manager",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
  ],
  [
    "user-2",
    {
      id: "user-2",
      name: "Mark Lee",
      email: "mark@workzup.com",
      avatar: "/avatars/mark.svg",
      role: "Logistics Coordinator",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  [
    "user-3",
    {
      id: "user-3",
      name: "Aisha Khan",
      email: "aisha@workzup.com",
      avatar: "/avatars/aisha.svg",
      role: "HR Specialist",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
  ],
  [
    "user-4",
    {
      id: "user-4",
      name: "Carlos Mendez",
      email: "carlos@workzup.com",
      avatar: "/avatars/carlos.svg",
      role: "Site Manager",
      isOnline: false,
      lastSeen: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
]);

// ============================================
// JOBS DATA
// ============================================
const jobs: Map<string, JobDetails> = new Map([
  [
    "job-1",
    {
      id: "job-1",
      title: "Urgent Warehouse Assistant",
      payRate: "Rs.3000",
      location: "Colombo",
      date: "Nov 25",
      schedule: "9:00 AM - 5:00 PM",
      description:
        "We're looking for an experienced warehouse assistant to help out during a busy event. Must be able to lift heavy items and work flexible hours.",
      status: "open",
      createdBy: "user-1",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
  [
    "job-2",
    {
      id: "job-2",
      title: "Logistics Support",
      payRate: "Rs.2500",
      location: "Kandy",
      date: "Nov 28",
      schedule: "8:00 AM - 4:00 PM",
      description:
        "Support the logistics team with inventory management and shipment coordination.",
      status: "open",
      createdBy: "user-2",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ],
  [
    "job-3",
    {
      id: "job-3",
      title: "HR Administrative Assistant",
      payRate: "Rs.3500",
      location: "Colombo",
      date: "Dec 1",
      schedule: "9:00 AM - 5:00 PM",
      description:
        "Assist with HR documentation, onboarding, and employee record management.",
      status: "open",
      createdBy: "user-3",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  [
    "job-4",
    {
      id: "job-4",
      title: "Site Supervision Assistant",
      payRate: "Rs.4000",
      location: "Galle",
      date: "Dec 5",
      schedule: "7:00 AM - 3:00 PM",
      description:
        "Assist with site supervision, safety compliance, and team coordination.",
      status: "open",
      createdBy: "user-4",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
]);

// ============================================
// MESSAGES DATA
// ============================================
const messages: Map<string, Message[]> = new Map([
  [
    "conv-1",
    [
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "user-1",
        content: "Hi — I need help with the shipment today.",
        timestamp: "10:55 PM",
        createdAt: new Date(Date.now() - 600000).toISOString(),
        isRead: true,
        isEdited: false,
        isDeleted: false,
      },
      {
        id: "msg-2",
        conversationId: "conv-1",
        senderId: CURRENT_USER_ID,
        content: "Sure — what do you need?",
        timestamp: "10:57 PM",
        createdAt: new Date(Date.now() - 480000).toISOString(),
        isRead: true,
        isEdited: false,
        isDeleted: false,
      },
      {
        id: "msg-3",
        conversationId: "conv-1",
        senderId: "user-1",
        content: "Sounds great — I'll be there.",
        timestamp: "10:59 PM",
        createdAt: new Date(Date.now() - 360000).toISOString(),
        isRead: false,
        isEdited: false,
        isDeleted: false,
      },
    ],
  ],
  [
    "conv-2",
    [
      {
        id: "msg-4",
        conversationId: "conv-2",
        senderId: "user-2",
        content: "Can you cover the Saturday shift?",
        timestamp: "9:45 PM",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
        isEdited: false,
        isDeleted: false,
      },
      {
        id: "msg-5",
        conversationId: "conv-2",
        senderId: CURRENT_USER_ID,
        content: "Let me check my schedule and get back to you.",
        timestamp: "9:50 PM",
        createdAt: new Date(Date.now() - 6900000).toISOString(),
        isRead: true,
        isEdited: false,
        isDeleted: false,
      },
    ],
  ],
  [
    "conv-3",
    [
      {
        id: "msg-6",
        conversationId: "conv-3",
        senderId: "user-3",
        content: "Please complete your timesheet by EOD.",
        timestamp: "10:00 AM",
        createdAt: new Date(Date.now() - 28800000).toISOString(),
        isRead: true,
        isEdited: false,
        isDeleted: false,
      },
    ],
  ],
  ["conv-4", []],
]);

// ============================================
// CONVERSATIONS DATA
// ============================================
const conversations: Map<string, Conversation> = new Map([
  [
    "conv-1",
    {
      id: "conv-1",
      type: "job",
      participants: [users.get("current-user-123")!, users.get("user-1")!],
      jobId: "job-1",
      job: jobs.get("job-1"),
      lastMessage: messages.get("conv-1")?.slice(-1)[0],
      lastMessageTime: "10:59 PM",
      unreadCount: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isArchived: false,
      isPinned: true,
    },
  ],
  [
    "conv-2",
    {
      id: "conv-2",
      type: "job",
      participants: [users.get("current-user-123")!, users.get("user-2")!],
      jobId: "job-2",
      job: jobs.get("job-2"),
      lastMessage: messages.get("conv-2")?.slice(-1)[0],
      lastMessageTime: "9:50 PM",
      unreadCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isArchived: false,
      isPinned: false,
    },
  ],
  [
    "conv-3",
    {
      id: "conv-3",
      type: "job",
      participants: [users.get("current-user-123")!, users.get("user-3")!],
      jobId: "job-3",
      job: jobs.get("job-3"),
      lastMessage: messages.get("conv-3")?.slice(-1)[0],
      lastMessageTime: "10:00 AM",
      unreadCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      isArchived: false,
      isPinned: false,
    },
  ],
  [
    "conv-4",
    {
      id: "conv-4",
      type: "job",
      participants: [users.get("current-user-123")!, users.get("user-4")!],
      jobId: "job-4",
      job: jobs.get("job-4"),
      lastMessage: undefined,
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      isArchived: false,
      isPinned: false,
    },
  ],
]);

// Typing status storage
const typingStatus: Map<string, TypingStatus> = new Map();

// ============================================
// DATABASE OPERATIONS
// ============================================

// USER OPERATIONS
export function getUser(userId: string): User | undefined {
  return users.get(userId);
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function updateUserOnlineStatus(
  userId: string,
  isOnline: boolean,
): User | undefined {
  const user = users.get(userId);
  if (user) {
    user.isOnline = isOnline;
    user.lastSeen = new Date().toISOString();
    users.set(userId, user);
  }
  return user;
}

// CONVERSATION OPERATIONS
export function getConversation(
  conversationId: string,
): Conversation | undefined {
  return conversations.get(conversationId);
}

export function getAllConversations(userId: string): Conversation[] {
  return Array.from(conversations.values())
    .filter((conv) => conv.participants.some((p) => p.id === userId))
    .sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by last message time
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });
}

export function createConversation(
  data: Omit<Conversation, "id" | "createdAt">,
): Conversation {
  const id = `conv-${Date.now()}`;
  const conversation: Conversation = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  conversations.set(id, conversation);
  messages.set(id, []);
  return conversation;
}

export function updateConversation(
  conversationId: string,
  data: Partial<Conversation>,
): Conversation | undefined {
  const conversation = conversations.get(conversationId);
  if (conversation) {
    const updated = {
      ...conversation,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    conversations.set(conversationId, updated);
    return updated;
  }
  return undefined;
}

export function archiveConversation(
  conversationId: string,
): Conversation | undefined {
  return updateConversation(conversationId, { isArchived: true });
}

export function pinConversation(
  conversationId: string,
  isPinned: boolean,
): Conversation | undefined {
  return updateConversation(conversationId, { isPinned });
}

// MESSAGE OPERATIONS
export function getMessages(conversationId: string): Message[] {
  return (messages.get(conversationId) || []).filter((m) => !m.isDeleted);
}

export function getMessage(
  conversationId: string,
  messageId: string,
): Message | undefined {
  return messages.get(conversationId)?.find((m) => m.id === messageId);
}

export function createMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyToId?: string,
): Message | undefined {
  const conversationMessages = messages.get(conversationId);
  if (!conversationMessages) return undefined;

  const newMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    conversationId,
    senderId,
    content,
    timestamp: new Date()
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
      .replace(" ", " "),
    createdAt: new Date().toISOString(),
    isRead: false,
    isEdited: false,
    isDeleted: false,
    replyToId,
  };

  conversationMessages.push(newMessage);
  messages.set(conversationId, conversationMessages);

  // Update conversation's last message
  const conversation = conversations.get(conversationId);
  if (conversation) {
    conversation.lastMessage = newMessage;
    conversation.lastMessageTime = newMessage.timestamp;
    conversation.updatedAt = new Date().toISOString();
    conversations.set(conversationId, conversation);
  }

  return newMessage;
}

export function updateMessage(
  conversationId: string,
  messageId: string,
  content: string,
): Message | undefined {
  const conversationMessages = messages.get(conversationId);
  if (!conversationMessages) return undefined;

  const messageIndex = conversationMessages.findIndex(
    (m) => m.id === messageId,
  );
  if (messageIndex === -1) return undefined;

  conversationMessages[messageIndex] = {
    ...conversationMessages[messageIndex],
    content,
    updatedAt: new Date().toISOString(),
    isEdited: true,
  };

  messages.set(conversationId, conversationMessages);
  return conversationMessages[messageIndex];
}

export function deleteMessage(
  conversationId: string,
  messageId: string,
): boolean {
  const conversationMessages = messages.get(conversationId);
  if (!conversationMessages) return false;

  const messageIndex = conversationMessages.findIndex(
    (m) => m.id === messageId,
  );
  if (messageIndex === -1) return false;

  // Soft delete - mark as deleted but keep the record
  conversationMessages[messageIndex] = {
    ...conversationMessages[messageIndex],
    isDeleted: true,
    content: "This message was deleted",
    updatedAt: new Date().toISOString(),
  };

  messages.set(conversationId, conversationMessages);

  // Update last message in conversation if needed
  const conversation = conversations.get(conversationId);
  if (conversation && conversation.lastMessage?.id === messageId) {
    const visibleMessages = conversationMessages.filter((m) => !m.isDeleted);
    conversation.lastMessage = visibleMessages[visibleMessages.length - 1];
    conversation.lastMessageTime =
      conversation.lastMessage?.timestamp || "No messages";
    conversations.set(conversationId, conversation);
  }

  return true;
}

export function markMessageAsRead(
  conversationId: string,
  messageId: string,
): boolean {
  const conversationMessages = messages.get(conversationId);
  if (!conversationMessages) return false;

  const message = conversationMessages.find((m) => m.id === messageId);
  if (message) {
    message.isRead = true;
  }

  // Update unread count
  const conversation = conversations.get(conversationId);
  if (conversation) {
    const unreadCount = conversationMessages.filter(
      (m) => !m.isRead && m.senderId !== CURRENT_USER_ID,
    ).length;
    conversation.unreadCount = unreadCount;
    conversations.set(conversationId, conversation);
  }

  return true;
}

export function markAllMessagesAsRead(conversationId: string): boolean {
  const conversationMessages = messages.get(conversationId);
  if (!conversationMessages) return false;

  conversationMessages.forEach((m) => {
    if (m.senderId !== CURRENT_USER_ID) {
      m.isRead = true;
    }
  });

  const conversation = conversations.get(conversationId);
  if (conversation) {
    conversation.unreadCount = 0;
    conversations.set(conversationId, conversation);
  }

  return true;
}

// JOB OPERATIONS
export function getJob(jobId: string): JobDetails | undefined {
  return jobs.get(jobId);
}

export function updateJob(
  jobId: string,
  data: Partial<JobDetails>,
): JobDetails | undefined {
  const job = jobs.get(jobId);
  if (job) {
    const updated = {
      ...job,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    jobs.set(jobId, updated);

    // Update job in all related conversations
    conversations.forEach((conv, convId) => {
      if (conv.jobId === jobId) {
        conv.job = updated;
        conversations.set(convId, conv);
      }
    });

    return updated;
  }
  return undefined;
}

// TYPING STATUS OPERATIONS
export function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean,
): void {
  const key = `${conversationId}-${userId}`;
  if (isTyping) {
    typingStatus.set(key, {
      conversationId,
      userId,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  } else {
    typingStatus.delete(key);
  }
}

export function getTypingUsers(conversationId: string): User[] {
  const typingUsers: User[] = [];
  const now = Date.now();

  typingStatus.forEach((status, key) => {
    if (status.conversationId === conversationId && status.isTyping) {
      // Check if typing status is still valid (within last 3 seconds)
      if (now - new Date(status.timestamp).getTime() < 3000) {
        const user = users.get(status.userId);
        if (user && user.id !== CURRENT_USER_ID) {
          typingUsers.push(user);
        }
      } else {
        typingStatus.delete(key);
      }
    }
  });

  return typingUsers;
}

export function searchMessages(
  query: string,
  conversationId?: string,
): Message[] {
  const results: Message[] = [];
  const searchLower = query.toLowerCase();

  if (conversationId) {
    const convMessages = messages.get(conversationId) || [];
    return convMessages.filter(
      (m) => !m.isDeleted && m.content.toLowerCase().includes(searchLower),
    );
  }

  messages.forEach((convMessages) => {
    convMessages.forEach((m) => {
      if (!m.isDeleted && m.content.toLowerCase().includes(searchLower)) {
        results.push(m);
      }
    });
  });

  return results;
}
