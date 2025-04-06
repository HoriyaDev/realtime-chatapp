"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useUserIdStore } from "../store/store";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);

  const router = useRouter();

  const setSelectedUser = useUserIdStore(state => state.setSelectedUser)

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
      } else {
        console.error("Error fetching users:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserAndOthers();
  }, []);

  const handleClick = (user) => {
    setSelectedUser(user);
  // This updates the selectedUser in Zustand store
  };

 

  return (
    <>
      <div className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Users</h2>
        {otherUsers.map((u) => (
          <div
            key={u.id}
            className="py-2 border-b text-white border-gray-600 cursor-pointer"
            onClick={() => handleClick(u)}
          >
            {u.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
