'use client';
import React from "react";
import { IoMdSend } from "react-icons/io";
import { useSelectedUserStore, useChatStore, useUserStore } from "@/app/store/store";
import supabase from "@/app/lib/supabase";// Make sure this path is correct

const MessageInput = () => {
  // Get selected user's chat ID
  const { selectedUser } = useSelectedUserStore();
  const chatId = selectedUser?.id;

  // Get sender and receiver IDs
  const user = useUserStore((state) => state.user);
  const senderId = user?.id;
  const receiverId = selectedUser?.auth_id;

  // Input and actions from chat store
  const input = useChatStore((state) => state.getInput(chatId));
  const setInput = useChatStore((state) => state.setInput);
  const addMessage = useChatStore((state) => state.addMessage);

  // Function to send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!senderId || !receiverId) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          message: input.trim(),
        },
      ])
      .select();

    if (!error && data.length > 0) {
        console.log("message send successfully" , data)
      
    } else {
      console.error("❌ Error sending message:", error?.message);
    }

    // Clear input after sending
    setInput(chatId, "");
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
    <div className="flex items-center p-3 bg-[#f1f2f4] shadow-inner">
      <input
        type="text"
        placeholder="Type a message"
        className="p-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white text-[#1F2937]"
        value={input}
       
        onChange={(e) => {
            setInput(chatId, e.target.value)
            handleTyping();
          }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSendMessage();
        }}
        autoFocus
      />
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
