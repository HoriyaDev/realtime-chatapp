"use client";

import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useSelectedUserStore } from "../store/store";
import { IoSearchOutline } from "react-icons/io5";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentMessages, setRecentMessages] = useState({});

  const router = useRouter();
  const setSelectedUser = useSelectedUserStore((state) => state.setSelectedUser);

  // Fetch current user and all other users
  const fetchUserAndOthers = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (currentUser) {
      setUser(currentUser);
      setUserId(currentUser.id);

      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .neq("auth_id", currentUser.id);

      if (!error) {
        setOtherUsers(users || []);
        fetchRecentMessages(users, currentUser.id);
      } else {
        console.error("Error fetching users:", error);
      }
    }
  };

  // Fetch latest message for each user
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
        const unreadCount = await supabase
          .from("messages")
          .select("*")
          .eq("receiver_id", currentUserId)
          .eq("sender_id", u.auth_id)
          .eq("is_read", false);
        
        newRecentMessages[u.auth_id] = {
          message: msg.message,
          isReceiver: msg.sender_id !== currentUserId && !msg.is_read,
          unreadCount: unreadCount.length,
        };
      }
    }

    setRecentMessages(newRecentMessages);
  };

  // Real-time update (without full re-fetch)
  useEffect(() => {
    fetchUserAndOthers();

    const channel = supabase
      .channel("messages-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const { new: newMessage } = payload;

          // For receiver (user receiving the message)
          setRecentMessages((prev) => ({
            ...prev,
            [newMessage.sender_id]: {
              message: newMessage.message,
              isReceiver: newMessage.sender_id !== userId,
              unreadCount: prev[newMessage.sender_id]?.unreadCount + 1 || 1,
            },
          }));

          // For sender (user sending the message)
          if (newMessage.sender_id === userId) {
            setRecentMessages((prev) => ({
              ...prev,
              [newMessage.receiver_id]: {
                message: newMessage.message,
                isReceiver: false, // Mark as read or already seen on sender's side
                unreadCount: 0, // Sender doesn't need a "new message" count
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

  // On user click: open chat + mark as read
  const handleClick = async (selectedUser) => {
    setSelectedUser(selectedUser);

    const { data: latestMsg } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", selectedUser.auth_id)
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestMsg && !latestMsg.is_read) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", latestMsg.id);

      setRecentMessages((prev) => ({
        ...prev,
        [selectedUser.auth_id]: {
          ...prev[selectedUser.auth_id],
          isReceiver: false,
          unreadCount: 0,
        },
      }));
    }
  };

  const filteredUsers = otherUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen p-4 flex flex-col">
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
        </div>
      </div>

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
                <div className="flex flex-col">
                  <p className="font-medium">{u.name}</p>
                  <p
                    className={`text-sm ${
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
    </div>
  );
};

export default Sidebar;