"use client";

import React from 'react';
import { useMessageNotification } from '@/lib/messaging/NotificationContext';

export default function MessagesBadge() {
  const { unreadCount } = useMessageNotification();

  return (
    <div className="relative inline-flex items-center">
      <span>Messages</span>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold leading-none text-white bg-red-500 rounded-full shadow-sm ring-1 ring-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}
