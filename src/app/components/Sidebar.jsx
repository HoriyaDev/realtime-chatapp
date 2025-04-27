"use client";

import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useSelectedUserStore, useAddUserStore } from "../store/store";
import { IoSearchOutline } from "react-icons/io5";
import AddUser from "../modal/AddUser"; // Assuming you have this component for adding users

const Sidebar = () => {
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentMessages, setRecentMessages] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const setSelectedUser = useSelectedUserStore((state) => state.setSelectedUser);
  const { selectedUsers } = useAddUserStore();

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const fetchUserAndOthers = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (currentUser) {
      setUserId(currentUser.id);

      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .neq("auth_id", currentUser.id);

      if (!error) {
        fetchRecentMessages(users, currentUser.id);
      } else {
        console.error("Error fetching users:", error);
      }
    }
  };

  const fetchRecentMessages = async (users, currentUserId) => {
    const newRecentMessages = {};

    for (let u of users) {
      const { data: messageData } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${u.auth_id}),and(sender_id.eq.${u.auth_id},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: false })
        .limit(1);

      if (messageData && messageData.length > 0) {
        const msg = messageData[0];

        // Get unread messages after this last message
        const { data: unreadMessages } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .eq("sender_id", u.auth_id)
          .eq("receiver_id", currentUserId)
          .eq("is_read", false)
          .gt("created_at", msg.created_at); // Filter unread after this message

        newRecentMessages[u.auth_id] = {
          message: msg.message,
          isReceiver: msg.sender_id !== currentUserId,
          unreadCount: unreadMessages?.length || 0,
        };
      }
    }

    setRecentMessages(newRecentMessages);
  };

  useEffect(() => {
    fetchUserAndOthers();

    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new;

          if (!newMessage) return;

          if (newMessage.receiver_id === userId) {
            setRecentMessages((prev) => ({
              ...prev,
              [newMessage.sender_id]: {
                message: newMessage.message,
                isReceiver: true,
                unreadCount: (prev[newMessage.sender_id]?.unreadCount || 0) + 1,
              },
            }));
          }

          if (newMessage.sender_id === userId) {
            setRecentMessages((prev) => ({
              ...prev,
              [newMessage.receiver_id]: {
                message: newMessage.message,
                isReceiver: false,
                unreadCount: 0,
              },
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleClick = async (selectedUser) => {
    setSelectedUser(selectedUser);

    const { data: unreadMessages } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", selectedUser.auth_id)
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (unreadMessages && unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map((msg) => msg.id);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);

      setRecentMessages((prev) => ({
        ...prev,
        [selectedUser.auth_id]: {
          ...prev[selectedUser.auth_id],
          unreadCount: 0, // Reset unread count after reading
          isReceiver: false,
        },
      }));
    }
  };

  const filteredUsers = selectedUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen p-4 flex flex-col">
      {/* Top Section */}
      <div>
        <p className="font-semibold text-2xl mb-3">Chats</p>

        <div className="flex items-center px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 dark:text-white">
          <IoSearchOutline />
          <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none bg-transparent text-sm pl-4"
          />
          <button
            onClick={handleOpen}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="mt-4 overflow-y-auto custom-scrollbar pr-1 max-h-[calc(100vh-150px)]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => handleClick(u)}
              className="py-2 px-2 border-b border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <div className="flex gap-3 items-center">
                <img
                  src={u.profile_pic}
                  alt="profile"
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div className="flex flex-col flex-1">
                  <p className="font-medium">{u.name}</p>

                  <p
                    className={`text-sm truncate ${
                      recentMessages[u.auth_id]?.isReceiver
                        ? "font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    {recentMessages[u.auth_id]?.message || "No messages yet"}
                  </p>
                </div>

                {recentMessages[u.auth_id]?.unreadCount > 0 && (
                  <div className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs">
                    {recentMessages[u.auth_id]?.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mt-6 text-center">No users found</p>
        )}
      </div>
      {isOpen && <AddUser isOpen={isOpen} onClose={handleOpen} />}
    </div>
  );
};

export default Sidebar;
