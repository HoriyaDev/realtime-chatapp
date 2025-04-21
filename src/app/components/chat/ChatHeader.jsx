import React, { useEffect } from 'react'
import { IoCall, IoVideocam } from "react-icons/io5";
import { useSelectedUserStore } from "@/app/store/store";


const ChatHeader = () => {
    const  selectedUser = useSelectedUserStore((state) => state.selectedUser);

    useEffect(()=>{

        console.log(selectedUser?.name)
    },[])

  return (
   <>
   <header className="bg-[#eeeff0] text-[#1F2937] flex items-center justify-between p-3 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={selectedUser?.profile_pic || "default-user.png"} // Replace with dynamic user image
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 className="text-lg font-semibold">{selectedUser?.name}</h1>
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

   </>
  )
}

export default ChatHeader