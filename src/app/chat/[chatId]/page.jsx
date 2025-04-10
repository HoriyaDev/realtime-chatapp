"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useUserIdStore } from "@/app/store/store";
import { supabase } from "@/app/lib/supabase";

import { useUserStore } from "@/app/store/store"; // Import the store

const ChatWindow = () => {
  const [sendMessage, setSendMessage] = useState("");
  const [showMessage, setShowMessage] = useState([]);

  const selectedUser = useUserIdStore((state) => state.selectedUser);
  const name = selectedUser?.name;

  const loggedUser = useUserStore((state) => state.user);


  const handleSendMessage = async () => {
  
    const authUser = await supabase.auth.getUser();
    console.log('Authenticated User:', authUser); 
    
     const userId = authUser?.data?.user?.id; 

  
    console.log("Authenticated user ID:", userId);
    console.log("Logged user ID:", loggedUser?.auth_id);
    console.log("Selected user ID:", selectedUser?.auth_id);
  
    // Ensure sender_id matches the authenticated user
    if (loggedUser?.auth_id !== userId) {
      console.error("Sender ID mismatch. Cannot send message.");
      return;
    }
  
    // Proceed with inserting the message
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: userId,
          receiver_id: selectedUser?.auth_id,
          message: sendMessage,
        },
      ])
      .select(); // Ensure data is returned
  
    if (error) {
      console.log("Error inserting message:", error);
    } else {
      console.log("Message sent:", messageData);
      setSendMessage(""); // Clear the input only after successful insert
    }
  };
  
  useEffect(() => {
    if (!loggedUser?.auth_id || !selectedUser?.auth_id) {
      console.log("User or selected user data is not available yet.");
      return;
    }
  
    const fetchMessages = async () => {
      const auth = await supabase.auth.getUser();
      const user_id = auth?.data?.user?.id;  // Get authenticated user ID inside fetchMessages
  
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("sender_id", user_id)  // Use user_id here
          .eq("receiver_id", selectedUser.auth_id)
          .order("created_at", { ascending: false });
  
        if (error) {
          console.error("Error fetching messages:", error);
        } else {
          console.log("Fetched messages:", data);
          setShowMessage(data);
        }
      } catch (error) {
        console.error("Error while fetching messages:", error);
      }
    };
  
    fetchMessages();
  }, [loggedUser?.auth_id, selectedUser?.auth_id]); // Use these as dependencies
   // Use these as dependencies

  return (
    <div className="flex flex-col justify-between h-screen p-4">
      {/* Displaying the user's name at the top */}
      <div className="bg-red-300 p-4 rounded">
        {name ? name : "No user selected"}
      </div>

      {/* Input and Button at the bottom */}
      <div className="flex space-y-2 w-full max-w-xs mt-auto">


      <div>
  {showMessage && showMessage.length > 0 ? (
    showMessage.map((msg) => (
      <div key={msg.id} className="message">
        <p>{msg.message}</p> {/* Adjust based on your data structure */}
      </div>
    ))
  ) : (
    <p>No messages yet</p>
  )}
</div>

        <input
          type="text"
          placeholder="Type a message"
          className="p-2 border border-gray-300 rounded"
          value={sendMessage}
          onChange={(e) => setSendMessage(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-2 rounded cursor-pointer"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
