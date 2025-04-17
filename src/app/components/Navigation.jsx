'use client';

import React, { useEffect } from 'react'; // ✅ added useEffect
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { PiChatCircleTextLight } from 'react-icons/pi';

import Profile from './Profile';
import Sidebar from './Sidebar';
import { useUserProfile } from '../store/store';

const Navigation = () => {
  const userProfile = useUserProfile((state) => state.userProfile);
  useEffect(() => {
    if (userProfile) {
      console.log("Navigation user profile name:", userProfile); // Direct access
    } else {
      console.log("User profile is still loading...");
    }
  }, [userProfile]);
  


  return (
    <TabGroup manual className="flex h-screen transition-all duration-300">
      {/* Sidebar */}
      <TabList className="flex flex-col w-16 mx-auto bg-[#eeeff0] text-[#1F2937] items-center shadow-lg">
        <Tab className="cursor-pointer flex items-center justify-center w-full h-12 focus:outline-none hover:bg-[#E5E7EB] transition">
          <PiChatCircleTextLight size={30}  />
        </Tab>
        <Tab className="flex items-center justify-center cursor-pointer w-full h-12 focus:outline-none hover:bg-[#E5E7EB] transition">
          <img
            src={userProfile?.profile_pic || '/default-user.png'}
            className="w-10 h-10 rounded-full object-cover"
            alt="Profile"
          />
        </Tab>
      </TabList>

      {/* Main Content */}
      <TabPanels className="w-96 bg-white text-[#1F2937] shadow-md">
        <TabPanel>
          <Sidebar />
        </TabPanel>
        <TabPanel>
          <Profile />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
};

export default Navigation;
