'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelectedUserStore, useUserStore } from '@/app/store/store';
import { IoCall, IoVideocam } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { format } from 'date-fns';

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
      console.log(data.created_at);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [showMessage]);


  useEffect(() => {
    if (selectedUser && senderId) {
      fetchMessages();
    }
  }, [selectedUser, senderId]);


  useEffect(() => {
    if (!senderId || !receiverId) return;

   
    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${senderId}`,
        },
        (payload) => {
          console.log('📥 New message received:', payload.new);
          setShowMessage((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); 
    };
  }, [senderId, receiverId]);

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#F9FAFB] text-[#1F2937] flex items-center justify-between p-3 shadow-md">
        {/* Left Side (Profile + Name) */}
        <div className="flex items-center gap-3">
          <img
            src="Profile.jpg"
            className="w-12 h-12 border-2 border-[#3B82F6] rounded-full object-cover"
          />
          <h1 className="text-lg font-semibold">{selectedUserName}</h1>
        </div>

        {/* Right Side (Icons) */}
        <div className="flex items-center gap-3">
          <IoCall size={24} className="hover:text-[#60A5FA] cursor-pointer transition" />
          <IoVideocam size={24} className="hover:text-[#60A5FA] cursor-pointer transition" />
        </div>
      </header>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-4 mb-2 ">
        {showMessage.length > 0 ? (
          showMessage.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 m-1 rounded max-w-fit ${
                msg.sender_id === senderId
                  ? 'bg-blue-100 text-right ml-auto'
                  : 'bg-gray-100 text-left mr-auto'
              }`}
            >
              <p>{msg.message}</p>
              <p>  {format(new Date(msg.created_at), 'p')}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center p-3 bg-[#F9FAFB] shadow-md">
        <input
          type="text"
          placeholder="Type a message"
        className="p-2 w-full border border-[#babcc0] rounded-full focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white text-[#1F2937]"
          value={sendMessage}
          onChange={(e) => setSendMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          className="p-3 bg-[#3B82F6] text-white rounded-full ml-3 hover:bg-blue-700 transition"
          onClick={handleSendMessage}
        >
         <IoMdSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
