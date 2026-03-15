"use client";

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import MessageInput from './MessageInput';

export default function ChatArea({ conversation, currentUserId }: { conversation: any, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    socket.on('connect', () => {
      socket.emit('join_room', conversation.id);
    });

    socket.on('receive_message', (newMsg: any) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id || m.timestamp === newMsg.timestamp && m.content === newMsg.content)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      socket.emit('leave_room', conversation.id);
      socket.disconnect();
    };
  }, [conversation?.id]);

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
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content || msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${isMine ? 'text-indigo-200 text-right' : 'text-gray-400 text-right'}`}>
                    {msg.timestamp || 'Just now'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <MessageInput 
        conversationId={conversation.id} 
        currentUserId={currentUserId} 
        onMessageSent={handleMessageSent} 
      />
    </div>
  );
}
