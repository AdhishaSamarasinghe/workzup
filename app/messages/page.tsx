"use client";

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import InboxSidebar from '@/components/chat/InboxSidebar';
import ChatArea from '@/components/chat/ChatArea';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Hardcode current user ID for testing since auth is outside scope of this task
  const currentUserId = "user-1"; 

  useEffect(() => {
    const s = io('http://localhost:5000', { withCredentials: true });
    setSocket(s);

    s.on('connect', () => {
      s.emit('setup_user', currentUserId);
    });

    s.on('online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    s.on('user_connected', (userId: string) => {
      setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
    });

    s.on('user_disconnected', (userId: string) => {
      setOnlineUsers(prev => prev.filter(u => u !== userId));
    });

    return () => {
      s.disconnect();
    };
  }, [currentUserId]);

  return (
    <div className="flex justify-center h-[calc(100vh-80px)] mt-[80px] bg-[#f9fafb] p-6 lg:p-8">
      <div className="flex w-full max-w-7xl bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      <InboxSidebar 
        onSelectConversation={setSelectedConversation} 
        selectedId={selectedConversation?.id || null} 
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 bg-[#fcfcfd] flex flex-col h-full border-l border-gray-100 overflow-hidden relative">
        {selectedConversation && socket ? (
          <ChatArea conversation={selectedConversation} currentUserId={currentUserId} socket={socket} onlineUsers={onlineUsers} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
