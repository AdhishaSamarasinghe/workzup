"use client";

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import InboxSidebar from '@/components/chat/InboxSidebar';
import ChatArea from '@/components/chat/ChatArea';
import { apiFetch, API_BASE } from '@/lib/api';

type TokenPayload = {
  userId?: string;
  id?: string;
  sub?: string;
};

function getUserIdFromToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded)) as TokenPayload;
    return decoded.userId || decoded.id || decoded.sub || null;
  } catch {
    return null;
  }
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);

  useEffect(() => {
    const tokenUserId = getUserIdFromToken();
    if (tokenUserId) {
      setCurrentUserId(tokenUserId);
      setLoadingIdentity(false);
      return;
    }

    const resolveFromProfile = async () => {
      try {
        const profile = await apiFetch('/api/auth/profile');
        if (profile?.id) {
          setCurrentUserId(profile.id);
        }
      } catch {
        setCurrentUserId(null);
      } finally {
        setLoadingIdentity(false);
      }
    };

    void resolveFromProfile();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const s = io(API_BASE, { withCredentials: true });
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
      setSocket(null);
      setOnlineUsers([]);
    };
  }, [currentUserId]);

  if (loadingIdentity) {
    return (
      <div className="mt-[80px] flex h-[calc(100vh-80px)] items-center justify-center bg-[#f9fafb]">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="mt-[80px] flex h-[calc(100vh-80px)] items-center justify-center bg-[#f9fafb] px-6 text-center">
        <p className="text-gray-500">Please sign in to use messages.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-[calc(100vh-80px)] mt-[80px] bg-[#f9fafb] p-6 lg:p-8">
      <div className="flex w-full max-w-7xl bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      <InboxSidebar 
        currentUserId={currentUserId}
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
