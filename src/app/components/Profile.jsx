'use client';

import React, { useState, useEffect, useRef } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoCameraSharp } from "react-icons/io5";
import supabase from "../lib/supabase";
import { useUserProfile } from "../store/store";

const Profile = () => {
  const [input, setInput] = useState("");
  const [count, setCount] = useState(50);
  const [userData, setUserData] = useState({
    name: "",
 
    profile_pic: "/default-user.png",
  });
const setUserProfile = useUserProfile((state) => state.setUserProfile);
  const fileInputRef = useRef(null);

  const handleInput = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setInput(value);
      setCount(50 - value.length);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("auth_id", userId);

      if (!error && data?.length) {
        setUserData((prev) => ({
          ...prev,
          ...data[0],
        }));
       setUserProfile(data[0])
      } else {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="bg-gray-100 h-screen">
      <p className="font-semibold text-2xl p-4">Profile</p>

      <div className="py-5 flex flex-col items-center">
        <div className="relative w-44 h-44 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 rounded-full">
            <span className="text-white text-sm font-semibold flex flex-col justify-center items-center text-center">
              <IoCameraSharp className="mx-auto text-xl" />
              <p className="mt-3">
                <span className="block">CHANGE</span>
                <span className="block">PROFILE PHOTO</span>
              </p>
            </span>
          </div>
          <img
            src={userData.profile_pic || "/default-user.png"}
            className="w-full h-full object-cover"
            alt="User Profile"
          />
        </div>
        <input type="file" ref={fileInputRef} className="mt-4 hidden" />
      </div>

      <p className="mt-10 font-medium text-xl pl-4">Your name</p>
      <p className="font-medium text-lg pl-4">{userData.name || "No name"}</p>

      <div className="p-6 mt-5">
        <p>This name will be visible to your contacts</p>
      </div>

      <p className="mt-10 font-medium text-xl pl-4">About</p>
      <div className="relative w-[95%] mx-auto">
        <input
          type="text"
          value={input}
          onChange={handleInput}
          className="w-full pr-14 py-3 outline-none border-b-2 border-green-500"
          placeholder="Bio"
        />
        <p className="absolute right-10 inset-y-3">{count}</p>
        <button type="button" className="absolute inset-y-3 right-2">
          <FaCheck size={20} />
        </button>
      </div>
    </div>
  );
};

export default Profile;
