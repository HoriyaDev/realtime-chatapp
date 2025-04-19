'use client';

import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { useAddUserStore } from "../store/store";
import { toast } from "react-hot-toast";

const AddUser = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const setAddUser = useAddUserStore((state) => state.setAddUser);
  const addToSelectedUsers = useAddUserStore((state) => state.addToSelectedUsers);
  const addUser = useAddUserStore((state) => state.addUser);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setAddUser(null);
    }
  }, [isOpen, setAddUser]);

  const handleInput = (e) => {
    setName(e.target.value);
  };

  const fetchUserAndOthers = async () => {
    if (!name.trim()) {
      toast.error("Please enter a username.");
      return;
    }

    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (currentUser) {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("name", name)
        .neq("auth_id", currentUser.id);

      if (error) {
        console.error("Error fetching users:", error.message);
        toast.error("Something went wrong.");
      } else if (users?.length > 0) {
        setAddUser(users[0]);
      } else {
        toast.error("User not found.");
        setAddUser(null);
      }
    } else {
      toast.error("Failed to get current user.");
    }

    setLoading(false);
  };

  const handleAddUserToSidebar = () => {
    if (addUser) {
      addToSelectedUsers(addUser);
      toast.success("User added to sidebar!");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New User</h2>
          <button onClick={onClose} className="text-red-500 font-bold">X</button>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={handleInput}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          onClick={fetchUserAndOthers}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {addUser && (
          <div className="mt-4 text-center">
            <p className="mb-2 font-medium">User found: {addUser?.name}</p>
            <img
              src={addUser?.profile_pic || "/default-avatar.png"}
              alt="Profile"
              className="w-12 h-12 rounded-full mx-auto my-2"
            />
            <button
              onClick={handleAddUserToSidebar}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUser;
