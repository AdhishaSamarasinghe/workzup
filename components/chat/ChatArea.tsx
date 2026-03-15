"use client";

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';

export default function ChatArea({ conversation, currentUserId }: { conversation: any, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = React.useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversation?.id) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/messages?conversationId=${conversation.id}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id) return;

    const socket: Socket = io('http://localhost:5000', {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', conversation.id);
    });

    socket.on('receive_message', (newMsg: any) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id || m.timestamp === newMsg.timestamp && m.content === newMsg.content)) return prev;
        return [...prev, newMsg];
      });
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
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversation?.id]);

  const emitTyping = (isTyping: boolean) => {
    if (socketRef.current && conversation?.id) {
      const eventName = isTyping ? 'typing' : 'stop_typing';
      socketRef.current.emit(eventName, { conversationId: conversation.id, senderId: currentUserId });
    }
  };

  const otherParticipant = conversation.participants?.find((p: string) => p !== currentUserId) || 'Unknown User';

  const handleMessageSent = (newMsg: any) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{otherParticipant}</h3>
          <p className="text-xs text-gray-500">Live Chat</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-gray-500 mt-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No messages yet. Send a hello!</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isMine={msg.senderId === currentUserId} />
          ))
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
