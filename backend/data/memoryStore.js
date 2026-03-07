// Simple in-memory arrays to act like a fake database.
// All data resets when the backend server restarts.

const nowIso = new Date().toISOString();

// Seed a sample chat so the Messaging page has something to show.
const users = [
  {
    id: "current-user-123",
    name: "You",
    email: "user@workzup.com",
    avatar: "/avatars/default.svg",
    role: "Job Seeker",
    isOnline: true,
    lastSeen: nowIso,
  },
  {
    id: "recruiter-1",
    name: "John Recruiter",
    avatar: "/logo_main.png",
    role: "Recruiter",
    isOnline: true,
    lastSeen: nowIso,
  },
];

const jobs = [];

const conversations = [
  {
    id: "1",
    type: "direct",
    participants: [users[0], users[1]],

    // UI convenience field used by the current Messaging page implementation
    participant: users[1],

    lastMessage: "Hello, are you available for the job?",
    lastMessageTime: "10:30 AM",
    unreadCount: 1,
    isArchived: false,
    isPinned: false,
    createdAt: nowIso,
  },
];

const messages = [
  {
    id: "m1",
    conversationId: "1",
    senderId: "recruiter-1",
    content: "Hello, are you available for the job?",
    text: "Hello, are you available for the job?",
    replyToId: null,
    isRead: false,
    isEdited: false,
    isDeleted: false,
    timestamp: "10:30 AM",
    createdAt: nowIso,
  },
  {
    id: "m2",
    conversationId: "1",
    senderId: "current-user-123",
    content: "Yes — I’m interested. What time should I be there?",
    text: "Yes — I’m interested. What time should I be there?",
    replyToId: null,
    isRead: true,
    isEdited: false,
    isDeleted: false,
    timestamp: "10:32 AM",
    createdAt: nowIso,
  },
];

module.exports = {
  users,
  jobs,
  messages,
  conversations,
};
