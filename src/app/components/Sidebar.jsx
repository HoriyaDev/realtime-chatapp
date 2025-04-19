"use client";

import React, { useEffect, useState } from "react";
import AddUser from "../modal/AddUser";
import {
  useSelectedUserStore,
  useAddUserStore,
  useUserStore,
  useTypingIndicatorStore
} from "../store/store";
import supabase from "../lib/supabase";
import { IoSearchOutline } from "react-icons/io5";

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [latestMessages, setLatestMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const setSelectedUser = useSelectedUserStore((state) => state.setSelectedUser);
  const selectedUsers = useAddUserStore((state) => state.selectedUsers);
  const userData = useUserStore((state) => state.user);
  const senderId = userData?.id;


  const { setCurrentChatId, theirTyping, currentChatId } = useTypingIndicatorStore();
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = async (user) => {
    setSelectedUser(user);
    setCurrentChatId(user.auth_id);
    const receiverId = user.auth_id;

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .match({
        sender_id: receiverId,
        receiver_id: senderId,
        is_read: false,
      });

    if (!error) {
      setLatestMessages((prev) => {
        const updated = { ...prev };
        const msg = updated[receiverId];
        if (msg && msg.receiver_id === senderId) {
          updated[receiverId] = { ...msg, is_read: true };
        }
        return updated;
      });

      setUnreadCounts((prev) => ({
        ...prev,
        [receiverId]: 0,
      }));
    }
  };

  const filteredUsers = selectedUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!senderId || selectedUsers.length === 0) return;

    const fetchMessages = async () => {
      const newMessages = {};
      const newUnread = {};

      for (const user of selectedUsers) {
        const receiverId = user.auth_id;

        const { data, error } = await supabase
          .from("messages")
          .select("id, message, sender_id, receiver_id, is_read, created_at")
          .or(
            `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
          )
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && data.length > 0) {
          const latestMsg = data[0];
          newMessages[receiverId] = latestMsg;

          // ✅ Only count if latest message is sent TO user and is unread
          newUnread[receiverId] =
            latestMsg.receiver_id === senderId && !latestMsg.is_read ? 1 : 0;
        } else {
          newUnread[receiverId] = 0;
        }
      }

      setLatestMessages(newMessages);
      setUnreadCounts(newUnread);
    };

    fetchMessages();

    const messageChannel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new;
          const otherUserId =
            newMsg.sender_id === senderId
              ? newMsg.receiver_id
              : newMsg.sender_id;

          setLatestMessages((prev) => ({
            ...prev,
            [otherUserId]: newMsg,
          }));

          if (newMsg.receiver_id === senderId && !newMsg.is_read) {
            
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [senderId, selectedUsers]);

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

        <button
          onClick={handleOpen}
          className="mt-3 bg-blue-500 text-white px-4 py-1 rounded"
        >
          Add
        </button>
      </div>

      <div className="mt-4 overflow-y-auto custom-scrollbar pr-1 max-h-[calc(100vh-150px)]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => {
            const msg = latestMessages[user.auth_id];
            const unreadCount = unreadCounts[user.auth_id] || 0;

            return (
              <div
                key={index}
                onClick={() => handleClick(user)}
                className="flex flex-col gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer relative"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile_pic}
                    className="w-10 h-10 object-cover rounded-full"
                    alt={user.name}
                  />
                  <p className="font-medium">{user.name}</p>
                  {theirTyping && user.auth_id !== currentChatId && (
                    <p>typing....</p>
                  )}

                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {msg && (
                  <p
                    className={`text-sm ml-12 truncate ${
                      !msg.is_read && msg.receiver_id === senderId
                        ? "font-bold"
                        : "font-normal"
                    }`}
                  >
                    {msg.message}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 mt-6 text-center">No users found</p>
        )}
      </div>

      {isOpen && <AddUser isOpen={isOpen} onClose={handleOpen} />}
    </div>
  );
};

export default Sidebar;
