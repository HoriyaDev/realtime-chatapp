'use client';
import React from 'react';
import ChatHeader from '@/app/components/chat/ChatHeader';
import MessageList from '@/app/components/chat/MessageList';
import MessageInput from '@/app/components/chat/MessageInput';
import { useSelectedUserStore } from "@/app/store/store";

const ChatWindow = () => {
   const  selectedUser = useSelectedUserStore((state) => state.selectedUser);
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-lg">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="shadow-lg">
        <ChatHeader />
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-auto p-4">
        <MessageList />
      </div>

      {/* Message Input */}
      <div className="shadow-lg">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
