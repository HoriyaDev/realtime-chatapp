'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelectedUserStore, useUserStore, useChatStore } from '@/app/store/store';
import supabase from '@/app/lib/supabase';
import { format } from "date-fns";
import DropDown from '../dropdown/DropDown';

const MessageList = () => {
  const { selectedUser } = useSelectedUserStore();
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const { setEditingId, setInput } = useChatStore();

  const receiverId = selectedUser?.auth_id;
  const senderId = user?.id;
  const messagesEndRef = useRef(null);

  const handleEdit = (msgId, text) => {
    setEditingId(msgId);
    setInput(selectedUser?.id, text);
  };

  const handleDelete = async (msgId) => {
    const { error } = await supabase.from('messages').delete().eq('id', msgId);

    if (error) {
      console.error('❌ Error deleting message:', error.message);
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
    }
  };

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        if (
          (newMessage.sender_id === senderId && newMessage.receiver_id === receiverId) ||
          (newMessage.sender_id === receiverId && newMessage.receiver_id === senderId)
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updatedMessage = payload.new;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? { ...msg, message: updatedMessage.message } : msg
          )
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const deletedId = payload.old.id;
        setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel('typing-channel')
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { sender_id, receiver_id } = payload.payload;
        if (sender_id === receiverId && receiver_id === senderId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [receiverId, senderId]);

  return (
    <div className="space-y-2 px-4 py-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`relative p-2 max-w-xs rounded-lg ${
            msg.sender_id === senderId
              ? 'bg-blue-500 text-white self-end ml-auto'
              : 'bg-gray-300 text-black self-start'
          }`}
        >
          {msg.message}
          <p className="text-xs text-gray-200 mt-1">
            {format(new Date(msg.created_at), "p")}
          </p>

          {/* Only apne message ke sath dropdown dikhao */}
          {msg.sender_id === senderId && (
            <div className="absolute top-1 right-1">
              <DropDown
                onEdit={() => handleEdit(msg.id, msg.message)}
                onDelete={() => handleDelete(msg.id)}
              />
            </div>
          )}
        </div>
      ))}

      {isTyping && <div className="text-sm italic text-gray-500">Typing...</div>}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
