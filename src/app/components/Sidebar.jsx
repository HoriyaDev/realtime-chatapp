"use client";

import React, { useState } from "react";
import AddUser from "../modal/AddUser";
import { useSelectedUserStore } from "../store/store";
import { useAddUserStore } from "../store/store";
import { IoSearchOutline } from "react-icons/io5";

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const setSelectedUser = useSelectedUserStore((state) => state.setSelectedUser);
  const selectedUsers = useAddUserStore((state) => state.selectedUsers);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = (user) => {
    setSelectedUser(user);
  };

  const filteredUsers = selectedUsers.filter((u) =>
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

        <button onClick={handleOpen} className="mt-3 bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>

      <div className="mt-4 overflow-y-auto custom-scrollbar pr-1 max-h-[calc(100vh-150px)]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => handleClick(user)}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <img src={user.profile_pic} className="w-10 h-10 object-cover rounded-full" />
              <p>{user.name}</p>
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
