"use client";

import React from 'react';

export default function MessageBubble({ msg, isMine }: { msg: any; isMine: boolean }) {
  const content = msg.content || msg.text || '';
  const isImage = content.startsWith('[IMAGE]');
  const imageUrl = isImage ? `http://localhost:5000${content.replace('[IMAGE]', '')}` : '';
  
  const isLocation = content.startsWith('[LOCATION]');
  const locationCoords = isLocation ? content.replace('[LOCATION]', '') : '';
  const mapLink = isLocation ? `https://www.google.com/maps/search/?api=1&query=${locationCoords}` : '';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group mb-2 animate-in-bubble`}>
      <div 
        className={`max-w-[75%] px-4 py-2 relative transition-all duration-200 ease-in-out hover:shadow-md ${
          isMine 
            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-sm' 
            : 'bg-white border text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border-gray-100'
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
        
        <div className={`flex items-center gap-1 mt-1 justify-end ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
          <span className="text-[10px] uppercase font-medium tracking-wider">
            {msg.timestamp || 'Just now'}
          </span>
          {isMine && (
            <svg 
              className={`w-3 h-3 ${msg.isRead ? 'text-blue-300' : 'text-indigo-300'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              {msg.isRead && (
                <path className="text-blue-300" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13l4 4L22 7"></path>
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
