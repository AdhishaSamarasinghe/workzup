"use client";

import React, { useState } from 'react';
import InboxSidebar from '@/components/chat/InboxSidebar';
import ChatArea from '@/components/chat/ChatArea';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Hardcode current user ID for testing since auth is outside scope of this task
  const currentUserId = "user-1"; 

  return (
    <div className="flex h-[calc(100vh-80px)] mt-[80px] bg-gray-50 border-t border-gray-200">
      <InboxSidebar 
        onSelectConversation={setSelectedConversation} 
        selectedId={selectedConversation?.id || null} 
      />
      
      <div className="flex-1 bg-white flex flex-col h-full border-l border-gray-200 overflow-hidden">
        {selectedConversation ? (
          <ChatArea conversation={selectedConversation} currentUserId={currentUserId} />
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
  );
}
