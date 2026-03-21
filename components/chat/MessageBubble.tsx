"use client";

import React from 'react';

type BubbleMessage = {
  content?: string;
  text?: string;
  timestamp?: string;
  [key: string]: unknown;
};

export default function MessageBubble({ msg, isMine, participantName }: { msg: BubbleMessage; isMine: boolean, participantName?: string }) {
  const content = msg.content || msg.text || '';
  const isImage = content.startsWith('[IMAGE]');
  const imageUrl = isImage ? `http://localhost:5000${content.replace('[IMAGE]', '')}` : '';
  
  const isLocation = content.startsWith('[LOCATION]');
  const locationCoords = isLocation ? content.replace('[LOCATION]', '') : '';
  const mapLink = isLocation ? `https://www.google.com/maps/search/?api=1&query=${locationCoords}` : '';

  const displayName = isMine ? 'You' : (participantName || 'User');

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group mb-4 animate-in-bubble`}>
      <div className={`flex max-w-[80%] gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600 font-medium text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Message Content & Meta */}
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          {/* Name & Time Row */}
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-sm font-semibold text-gray-800">{displayName}</span>
            <span className="text-[11px] font-medium text-gray-400">{msg.timestamp || '05:00 PM'}</span>
          </div>

          {/* Bubble */}
          <div 
            className={`px-4 py-3 relative rounded-2xl ${
              isMine 
                ? 'bg-[#3B82F6] text-white rounded-tr-sm shadow-sm' 
                : 'bg-[#F3F4F6] text-gray-800 rounded-tl-sm'
            }`}
          >
        {isImage ? (
          <div className="overflow-hidden rounded-lg mt-1 mb-2">
            <img src={imageUrl} alt="Attachment" className="max-w-full h-auto max-h-[300px] object-contain" />
          </div>
        ) : isLocation ? (
          <a 
            href={mapLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/20 no-underline"
          >
            <div className="bg-indigo-100 p-2 rounded-full shrink-0 text-indigo-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
               </svg>
            </div>
            <div className={`flex flex-col ${isMine ? 'text-white' : 'text-gray-800'}`}>
              <span className="font-medium text-sm">Shared Location</span>
              <span className="text-xs opacity-80">Click to view on map</span>
            </div>
          </a>
        ) : (
          <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
            {content}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
