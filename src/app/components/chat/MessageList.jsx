'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelectedUserStore, useUserStore } from '@/app/store/store';
import supabase from '@/app/lib/supabase';

const MessageList = () => {
  const { selectedUser } = useSelectedUserStore();
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState([]);

  const receiverId = selectedUser?.auth_id;
  const senderId = user?.id;

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!senderId || !receiverId) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
        )
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      } else {
        console.error('❌ Error fetching messages:', error?.message);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;

          if (
            (newMessage.sender_id === senderId && newMessage.receiver_id === receiverId) ||
            (newMessage.sender_id === receiverId && newMessage.receiver_id === senderId)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderId, receiverId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-2 px-4 py-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-2 max-w-xs rounded-lg ${
            msg.sender_id === senderId
              ? 'bg-blue-500 text-white self-end ml-auto'
              : 'bg-gray-300 text-black self-start'
          }`}
        >
          {msg.message}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
