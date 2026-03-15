"use client";

import React, { useState, useRef } from 'react';

export default function MessageInput({ conversationId, currentUserId, onMessageSent, onTyping }: any) {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadRes = await fetch('http://localhost:5000/messages/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success && uploadData.url) {
        const payload = {
          conversationId,
          senderId: currentUserId,
          content: `[IMAGE]${uploadData.url}`,
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
          conversationId,
          senderId: currentUserId,
          content: `[LOCATION]${latitude},${longitude}`,
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
    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />
        <button 
          type="button"
          onClick={handleLocation}
          disabled={isSending}
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
          title="Send Location"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
          title="Upload Image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
          </svg>
        </button>
        <input 
          type="text" 
          value={text} 
          onChange={handleChange}
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
