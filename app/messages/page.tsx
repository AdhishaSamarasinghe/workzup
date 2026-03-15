import React from 'react';

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] mt-[80px] bg-gray-50 border-t border-gray-200">
      <div className="w-1/3 min-w-[300px] border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {/* Inbox placeholders */}
          <div className="text-gray-500 text-sm text-center mt-4">No conversations selected</div>
        </div>
      </div>
      
      <div className="flex-1 bg-white flex flex-col items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p className="text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}
