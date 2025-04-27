


'use client';

import React, { useEffect, useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { PiChatCircleTextLight } from 'react-icons/pi';
import { useUserProfile } from '../store/store';

import Profile from './Profile';
import Sidebar from './Sidebar';

const Navigation = () => {
  const { userProfile } = useUserProfile();
  const { profile_pic } = userProfile;  // Destructure profile_pic and name

  
  return (
    <TabGroup manual>
      <div className="flex flex-col-reverse sm:flex-row h-screen transition-all duration-300 overflow-x-hidden">
        {/* Tabs (Top for small screens, Left for larger) */}
        <TabList className="flex sm:flex-col justify-around sm:justify-start w-full sm:w-16 bg-[#eeeff0] text-[#1F2937] items-center shadow-lg">
          <Tab className="cursor-pointer flex items-center justify-center w-full sm:w-full h-12 focus:outline-none hover:bg-[#E5E7EB] transition">
            <PiChatCircleTextLight size={30} />
          </Tab>
          <Tab className="cursor-pointer flex items-center justify-center w-full sm:w-full h-12 focus:outline-none hover:bg-[#E5E7EB] transition">
            <img
              src={profile_pic  || "/default-user.png"}  // Corrected image path
              className="w-10 h-10 rounded-full object-cover"
              alt="Profile"
            />
          </Tab>
        </TabList>

        {/* Panels (Chat List and Profile) */}
        <TabPanels className="flex-1 bg-white text-[#1F2937] shadow-md overflow-auto">
          <TabPanel>
            <Sidebar /> {/* Display Chat List */}
          </TabPanel>
          <TabPanel>
            <Profile /> {/* Display Profile */}
          </TabPanel>
        </TabPanels>
      </div>
    </TabGroup>
  );
};

export default Navigation;
