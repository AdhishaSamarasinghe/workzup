"use client";

import React, { useState } from 'react';

export default function MessageInput({ conversationId, currentUserId, onMessageSent }: any) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;

    setIsSending(true);
    try {
      const payload = {
        conversationId,
        senderId: currentUserId,
        content: text,
      };

      const res = await fetch('http://localhost:5000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success && onMessageSent) {
        onMessageSent(data.data);
      }
      setText("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow"
          disabled={isSending}
        />
        <button 
          type="submit" 
          disabled={!text.trim() || isSending}
          className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 w-12 h-12"
        >
          <svg className="w-5 h-5 translate-x-[1px] translate-y-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}
