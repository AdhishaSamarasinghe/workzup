"use client";

import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { apiFetch } from '@/lib/api';

const dedupeMessages = (list: any[]) => {
  const seen = new Set<string>();
  const output: any[] = [];

  for (const msg of Array.isArray(list) ? list : []) {
    const key = msg?.id
      ? `id:${msg.id}`
      : `fallback:${msg?.timestamp || msg?.createdAt || ""}:${msg?.content || msg?.text || ""}`;

    if (seen.has(key)) continue;
    seen.add(key);
    output.push(msg);
  }

  return output;
};

export default function ChatArea({ conversation, currentUserId, socket, onlineUsers = [] }: { conversation: any, currentUserId: string, socket: Socket, onlineUsers?: string[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = React.useRef<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!conversation?.id) return;
    let isActive = true;
    
    const fetchMessages = async (showLoader: boolean) => {
      if (showLoader && isActive) {
        setLoading(true);
      }

      try {
        const data = await apiFetch(`/conversations/${conversation.id}/messages`);
        if (data.success && isActive) {
          setMessages(dedupeMessages(data.data));
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        if (showLoader && isActive) {
          setLoading(false);
        }
      }
    };

    void fetchMessages(true);

    const pollInterval = window.setInterval(() => {
      void fetchMessages(false);
    }, 3000);

    return () => {
      isActive = false;
      window.clearInterval(pollInterval);
    };
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id) return;

    const markAsRead = async () => {
      try {
        await apiFetch(`/conversations/${conversation.id}/read`, {
          method: "PATCH",
        });
      } catch (error) {
        console.error("Failed to mark conversation as read", error);
      }
    };

    void markAsRead();
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id || !socket) return;
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit('join_room', conversation.id);
    };

    // Join immediately when conversation changes, and also after reconnects.
    socket.emit('join_room', conversation.id);
    socket.on('connect', handleConnect);

    socket.on('receive_message', (newMsg: any) => {
      setMessages((prev) => dedupeMessages([...prev, newMsg]));
      setTypingUsers((prev) => prev.filter(uid => uid !== newMsg.senderId));
    });

    socket.on('typing', ({ senderId }: { senderId: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(senderId)) return [...prev, senderId];
        return prev;
      });
    });

    socket.on('stop_typing', ({ senderId }: { senderId: string }) => {
      setTypingUsers((prev) => prev.filter(uid => uid !== senderId));
    });

    return () => {
      socket.emit('leave_room', conversation.id);
      socket.off('connect', handleConnect);
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop_typing');
      socketRef.current = null;
    };
  }, [conversation?.id, socket]);

  const emitTyping = (isTyping: boolean) => {
    if (socketRef.current && conversation?.id) {
      const eventName = isTyping ? 'typing' : 'stop_typing';
      socketRef.current.emit(eventName, { conversationId: conversation.id, senderId: currentUserId });
    }
  };

  const otherParticipant = conversation.otherUserName || conversation.participants?.find((p: string) => p !== currentUserId) || 'Unknown User';
  const isOnline = onlineUsers.includes(otherParticipant);

  const handleMessageSent = (newMsg: any) => {
    setMessages((prev) => dedupeMessages([...prev, newMsg]));
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 px-6 border-b border-gray-100 bg-white shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              {otherParticipant.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-[15px]">{otherParticipant}</h3>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-center leading-none">
                Visit 2
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Last visit Sep 16, 2024</p>
          </div>
        </div>
        
        {/* Actions */}
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 px-6 flex flex-col gap-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        
        {/* Mocked Date Separator */}
        <div className="flex justify-center my-6">
          <span className="bg-[#1e293b] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
            Today, Nov 16
          </span>
        </div>

        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No messages yet. Send a hello!</div>
        ) : (
          messages.map((msg, index) => {
            // Mock "New Message" separator logic: let's inject a visual line if there are multiple messages
            // For the sake of matching the UI exactly, let's inject it before the last message
            const showNewMessageDivider = messages.length > 2 && index === messages.length - 1;

            return (
              <React.Fragment key={`${msg.id || msg.timestamp || msg.createdAt || "msg"}-${index}`}>
                {showNewMessageDivider && (
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-red-200"></div>
                    <span className="text-red-500 font-semibold text-xs tracking-wide">New Message</span>
                    <div className="flex-1 h-px bg-red-200"></div>
                  </div>
                )}
                <MessageBubble 
                  msg={msg} 
                  isMine={msg.senderId === currentUserId} 
                  participantName={otherParticipant}
                />
              </React.Fragment>
            );
          })
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-2">
            <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput 
        conversationId={conversation.id} 
        currentUserId={currentUserId} 
        onMessageSent={handleMessageSent} 
        onTyping={emitTyping}
      />
    </div>
  );
}
