"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelectedUserStore, useUserStore } from "@/app/store/store";
import { IoCall, IoVideocam } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { format } from "date-fns";
import supabase from "@/app/lib/supabase";

const ChatWindow = () => {
  const [sendMessage, setSendMessage] = useState("");
  const [showMessage, setShowMessage] = useState([]);
  const messagesEndRef = useRef(null);

  const selectedUser = useSelectedUserStore((state) => state.selectedUser);
  const loggedUser = useUserStore((state) => state.user);

  const selectedUserName = selectedUser?.name || "No user selected";
  const selectedUserProfile = selectedUser?.profile_pic || "/default-user.png";
  const senderId = loggedUser?.id;
  const receiverId = selectedUser?.auth_id;

  // Fetch messages
  const fetchMessages = async () => {
    if (!senderId || !receiverId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .order("created_at", { ascending: true });

    if (!error) {
      setShowMessage(data);
    } else {
      console.error("❌ Error fetching messages:", error.message);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!senderId || !receiverId || !sendMessage.trim()) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          message: sendMessage.trim(),
        },
      ])
      .select();

    if (!error && data.length > 0) {
      setShowMessage((prev) => [...prev, data[0]]);
      setSendMessage("");
    } else {
      console.error("❌ Error sending message:", error?.message);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [showMessage]);

  // Initial fetch
  useEffect(() => {
    if (selectedUser && senderId) {
      fetchMessages();
    }
  }, [selectedUser, senderId]);

  // Real-time message listener
  useEffect(() => {
    if (!senderId || !receiverId) return;

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${senderId}`,
        },
        (payload) => {
          setShowMessage((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderId, receiverId]);

  // ✅ UI JSX
  return selectedUser ? (
    <div className="bg-cover bg-center w-full h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#eeeff0] text-[#1F2937] flex items-center justify-between p-3 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={selectedUserProfile}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 className="text-lg font-semibold">{selectedUserName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <IoCall
            size={24}
            className="hover:text-[#60A5FA] cursor-pointer transition"
          />
          <IoVideocam
            size={24}
            className="hover:text-[#60A5FA] cursor-pointer transition"
          />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {showMessage.length > 0 ? (
          showMessage.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-xl text-sm max-w-[75%] break-words ${
                msg.sender_id === senderId
                  ? "bg-blue-100 text-right ml-auto"
                  : "bg-gray-100 text-left mr-auto"
              }`}
            >
              <p>{msg.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(msg.created_at), "p")}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="flex items-center p-3 bg-[#f1f2f4] shadow-inner">
        <input
          type="text"
          placeholder="Type a message"
          className="p-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white text-[#1F2937]"
          value={sendMessage}
          onChange={(e) => setSendMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
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
  ) : (
    <div className="flex items-center justify-center h-screen text-gray-400 text-lg">
      Select a user to start chatting
    </div>
  );
};

export default ChatWindow;
