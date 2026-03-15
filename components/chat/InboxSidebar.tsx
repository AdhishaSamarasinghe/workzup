"use client";

import React, { useEffect, useState } from 'react';

export default function InboxSidebar({ onSelectConversation, selectedId }: { onSelectConversation: (conv: any) => void, selectedId: string | null }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:5000/conversations');
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error("Failed to load conversations", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, []);

  return (
    <div className="w-1/3 min-w-[300px] border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto w-full">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => onSelectConversation(conv)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedId === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 truncate pr-2">
                  {conv.participants?.[1] || conv.participants?.[0] || 'Unknown User'}
                </h3>
                <span className="text-xs text-gray-400 whitespace-nowrap">{conv.lastMessageTime}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage || 'No recent messages'}</p>
              {conv.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 mt-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {conv.unreadCount} Unread
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
