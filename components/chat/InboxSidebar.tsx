"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type SidebarConversation = {
  id: string;
  otherUserId?: string;
  otherUserName?: string;
  participants?: string[];
  jobTitle?: string;
  lastMessageTime?: string;
  lastMessage?: string;
  unreadCount?: number;
};

export default function InboxSidebar({ onSelectConversation, selectedId, onlineUsers = [], currentUserId }: { onSelectConversation: (conv: SidebarConversation) => void, selectedId: string | null, onlineUsers?: string[], currentUserId: string }) {
  const [conversations, setConversations] = useState<SidebarConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiFetch('/conversations');
        if (data.success) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error("Failed to load conversations", error);
      } finally {
        setLoading(false);
      }
    };
    
    void fetchConversations();

    const interval = window.setInterval(() => {
      void fetchConversations();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-[340px] border-r border-gray-100 bg-white flex flex-col h-full overflow-hidden shrink-0">
      {/* Header Area */}
      <div className="p-5 pb-3 border-b border-gray-100 shrink-0 flex flex-col gap-4">
        <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Messages</h2>
        
        {/* Search */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search patients" 
              className="w-full bg-gray-50 text-sm text-gray-900 placeholder-gray-400 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-indigo-100 transition-shadow transition-colors"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 bg-gray-100/80 rounded-lg w-full mt-1">
          <button className="flex-1 text-sm font-semibold text-gray-900 bg-white shadow-sm rounded-md py-1.5 transition-all">
            Active
          </button>
          <button className="flex-1 text-sm font-medium text-gray-500 hover:text-gray-700 py-1.5 transition-all">
            Inactive
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations yet</div>
        ) : (
          conversations.map((conv) => {
            const partnerId = conv.otherUserId || conv.participants?.find((p: string) => p !== currentUserId) || conv.participants?.[1] || conv.participants?.[0] || 'Unknown User';
            const partnerName = conv.otherUserName || partnerId;
            const jobTitle = conv.jobTitle || "Untitled job";
            const isOnline = onlineUsers.includes(partnerId);
            const isSelected = selectedId === conv.id;

            return (
              <div 
                key={conv.id} 
                onClick={() => onSelectConversation(conv)}
                className={`flex gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
                  isSelected 
                    ? 'bg-blue-50/50 border-blue-600' 
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {/* Placeholder for real avatar image */}
                    <span className="text-gray-600 font-medium text-sm">
                      {partnerId.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-[15px] truncate pr-2 ${isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                      {partnerName}
                    </h3>
                    <span className={`text-xs whitespace-nowrap ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                      {conv.lastMessageTime || 'Just now'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-gray-400">{jobTitle}</p>
                      <p className={`text-sm truncate ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
                        {conv.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
