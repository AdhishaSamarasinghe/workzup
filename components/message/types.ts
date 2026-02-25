// Types for Message components - Easy to integrate with backend

export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
}

// Props interfaces for components
export interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
  onDoubleClick?: (conversationId: string) => void;
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDoubleClickConversation?: (conversationId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMobileView?: boolean;
}

export interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  senderAvatar?: string;
}

export interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isMobileView?: boolean;
}

export interface MessageSidebarProps {
  activeItem?: string;
}

export interface MessageInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
}
