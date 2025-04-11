'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelectedUserStore, useUserStore } from '@/app/store/store';
import supabase from '@/app/lib/supabase';

const ChatWindow = () => {
  const [sendMessage, setSendMessage] = useState('');
  const [showMessage, setShowMessage] = useState([]);
  const messagesEndRef = useRef(null);

  const selectedUser = useSelectedUserStore((state) => state.selectedUser);
  const loggedUser = useUserStore((state) => state.user);

  const selectedUserName = selectedUser?.name || 'No user selected';
  const senderId = loggedUser?.id;
  const receiverId = selectedUser?.auth_id;

  // ✅ Fetch messages from Supabase
  const fetchMessages = async () => {
    if (!senderId || !receiverId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching messages:', error.message);
    } else {
      setShowMessage(data);
    }
  };

  // ✅ Send a new message
  const handleSendMessage = async () => {
    console.log('Sending message:', sendMessage);
    console.log('Sender:', senderId, 'Receiver:', receiverId);

    if (!senderId || !receiverId || !sendMessage.trim()) {
      console.warn('⚠️ Missing data for sending message');
      return;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          message: sendMessage.trim(),
        },
      ])
      .select();

    if (error) {
      console.error('❌ Error sending message:', error.message);
    } else if (data.length > 0) {
      setShowMessage((prev) => [...prev, data[0]]);
      setSendMessage('');
      console.log('✅ Message sent successfully:', data[0]);
    }
  };

  // ✅ Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [showMessage]);

  // ✅ Fetch messages when user changes
  useEffect(() => {
    if (selectedUser && senderId) {
      fetchMessages();
    }
  }, [selectedUser, senderId]);



  return (
    <div className="flex flex-col justify-between h-screen p-4">
      {/* Header */}
      <div className="bg-red-300 p-4 rounded font-semibold text-lg">
        {selectedUserName}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-4 mb-2">
        {showMessage.length > 0 ? (
          showMessage.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 m-1 rounded max-w-[75%] ${
                msg.sender_id === senderId
                  ? 'bg-blue-100 text-right ml-auto'
                  : 'bg-gray-100 text-left mr-auto'
              }`}
            >
              <p>{msg.message}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={sendMessage}
          onChange={(e) => setSendMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
