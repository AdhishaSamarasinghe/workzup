"use client";

import React, { useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';

type InputMessage = {
  id?: string;
  content?: string;
  text?: string;
  [key: string]: unknown;
};

interface MessageInputProps {
  conversationId: string;
  currentUserId: string;
  onMessageSent?: (message: InputMessage) => void;
  onTyping?: (isTyping: boolean) => void;
}

export default function MessageInput({ conversationId, currentUserId, onMessageSent, onTyping }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onTyping) onTyping(false);

    setIsSending(true);
    try {
      const payload = {
        messageText: text,
      };

      const data = await apiFetch(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadData = await apiFetch('/messages/upload', {
        method: 'POST',
        body: formData
      });
      
      if (uploadData.success && uploadData.url) {
        const payload = {
          messageText: `[IMAGE]${uploadData.url}`,
        };

        const data = await apiFetch(`/conversations/${conversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (data.success && onMessageSent) {
          onMessageSent(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to upload image", error);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");
    
    setIsSending(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const payload = {
          messageText: `[LOCATION]${latitude},${longitude}`,
        };

        const data = await apiFetch(`/conversations/${conversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (data.success && onMessageSent) {
          onMessageSent(data.data);
        }
      } catch (error) {
         console.error("Failed to send location", error);
      } finally {
         setIsSending(false);
      }
    }, () => {
      alert("Unable to retrieve your location");
      setIsSending(false);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
      <form onSubmit={handleSend} className="flex relative items-center gap-2 border border-gray-200 bg-white rounded-xl pr-2 pl-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />
        
        {/* Left Icons */}
        <div className="flex items-center gap-1">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            title="Upload Image"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </button>
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          <button 
            type="button" 
            onClick={handleLocation}
            disabled={isSending}
            title="Send Location"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>

        {/* Input Field */}
        <input 
          type="text" 
          value={text} 
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none text-[15px] outline-none px-2 py-3 placeholder-gray-400 min-w-0"
          disabled={isSending}
        />

        {/* Send Button */}
        <button 
          type="submit" 
          disabled={!text.trim() || isSending}
          className="bg-[#3B82F6] text-white rounded-lg px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
        >
          <svg className="w-4 h-4 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send
        </button>
      </form>
    </div>
  );
}
