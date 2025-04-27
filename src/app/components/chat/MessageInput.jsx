'use client';
import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { useSelectedUserStore, useChatStore, useUserStore } from "@/app/store/store";
import supabase from "@/app/lib/supabase";
import data from '@emoji-mart/data';
import dynamic from "next/dynamic";


const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });



const MessageInput = () => {
  const [showPicker, setShowPicker] = useState(false);
  const { selectedUser } = useSelectedUserStore();
  const chatId = selectedUser?.id;

  const user = useUserStore((state) => state.user);
  const senderId = user?.id;
  const receiverId = selectedUser?.auth_id;

  const input = useChatStore((state) => state.getInput(chatId));
  const setInput = useChatStore((state) => state.setInput);
  const editingId = useChatStore((state) => state.editingId);
  const setEditingId = useChatStore((state) => state.setEditingId);

  const handleEmojiSelect = (emoji) => {
    setInput(chatId, input + emoji.native); // Append to current input
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !senderId || !receiverId) return;

    if (editingId) {
      const { data, error } = await supabase
        .from("messages")
        .update({ message: input.trim() })
        .eq("id", editingId)
        .select();

      if (!error && data?.length) {
        console.log("✏️ Message edited:", data[0]);
        setEditingId(null);
      } else {
        console.log("❌ Error editing message:", error?.message);
      }
    } else {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ sender_id: senderId, receiver_id: receiverId, message: input.trim() }])
        .select();

      if (!error && data?.length > 0) {
        console.log("📨 Message sent:", data[0]);
      } else {
        console.log("❌ Error sending message:", error?.message);
      }
    }

    setInput(chatId, ""); // Clear input
  };

  const handleTyping = () => {
    if (!senderId || !receiverId) return;

    supabase.channel('typing-channel').send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        sender_id: senderId,
        receiver_id: receiverId,
      },
    });
  };

  return (
    <div className="flex items-center p-3 bg-[#f1f2f4] shadow-inner relative">
      <input
        type="text"
        placeholder="Type a message"
        className="p-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white text-[#1F2937]"
        value={input}
        onChange={(e) => {
          setInput(chatId, e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        autoFocus
      />

      {/* Emoji Button */}
      <button onClick={() => setShowPicker(!showPicker)} className="ml-2 text-xl">
        😊
      </button>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-16 right-2 z-50 md:bottom-20 md:right-4">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
        </div>
      )}

      {/* Send Button */}
      <button
        className="p-3 bg-[#3B82F6] text-white rounded-full ml-3 hover:bg-blue-700 transition"
        onClick={handleSendMessage}
      >
        <IoMdSend size={20} />
      </button>
    </div>
  );
};

export default MessageInput;
