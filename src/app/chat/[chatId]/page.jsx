'use client';

import React, { useEffect, useState } from 'react';
import { useSelectedUserStore, useUserIdStore } from '@/app/store/store';
import supabase from '@/app/lib/supabase';
import { useUserStore } from '@/app/store/store';

const ChatWindow = () => {
  const [sendMessage, setSendMessage] = useState('');
  const [showMessage, setShowMessage] = useState([]);

  const selectedUser =useSelectedUserStore((state) => state.selectedUser);
  const name = selectedUser?.name;

  const loggedUser = useUserStore((state) => state.user);

  const fetchMessages = async () => {
    const authUser = await supabase.auth.getUser();
    const userId = authUser?.data?.user?.id;

    if (!userId || !selectedUser?.auth_id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${selectedUser.auth_id}),and(sender_id.eq.${selectedUser.auth_id},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (!error) {
      setShowMessage(data);
    } else {
      console.error('Error fetching messages:', error.message);
    }
  };

  // ✅ Send a new message
  const handleSendMessage = async () => {
    const authUser = await supabase.auth.getUser();
    const userId = authUser?.data?.user?.id;

    if (!userId || !sendMessage || !selectedUser?.auth_id) return;

    const { data, error } = await supabase.from('messages').insert([
      {
        sender_id: userId,
        receiver_id: selectedUser.auth_id,
        message: sendMessage,
      },
    ]).select(); // select() returns the inserted row

    if (!error && data.length > 0) {
      setShowMessage((prevMessages) => [...prevMessages, data[0]]);
      setSendMessage(''); // clear input
    } else {
      console.error('Error sending message:', error.message);
    }
  };

  // ✅ Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  return (
    <div className="flex flex-col justify-between h-screen p-4">
      {/* Header with user name */}
      <div className="bg-red-300 p-4 rounded">
        {name ? name : 'No user selected'}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto mt-4 mb-2">
        {showMessage.length > 0 ? (
          showMessage.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 m-1 rounded ${
                msg.sender_id ===loggedUser?.auth_id
                  ? 'bg-blue-100 text-right'
                  : 'bg-gray-100 text-left'
              }`}
            >
              <p>{msg.message}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet</p>
        )}
      </div>

      {/* Message input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={sendMessage}
          onChange={(e) => setSendMessage(e.target.value)}
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
