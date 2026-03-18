"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function MessagesBadge() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setUnread(0);
        return;
      }

      try {
        const data = await apiFetch('/conversations/unread-count');
        if (data.success) setUnread(data.count);
      } catch (error) {
        console.warn("Failed to fetch unread count", error);
      }
    };

    fetchUnread();
    
    // Poll every 15 seconds for simplicity if we don't have global socket in header
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-flex items-center">
      <span>Messages</span>
      {unread > 0 && (
        <span className="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold leading-none text-white bg-red-500 rounded-full shadow-sm ring-1 ring-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </div>
  );
}
