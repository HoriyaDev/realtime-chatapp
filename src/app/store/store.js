"use client";

import { set } from "react-hook-form";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      signupData: null,

      setUser: (userData) => set({ user: userData, isLoggedIn: true }),

      resetUser: () => set({ user: null, isLoggedIn: false }),

      setSignupData: (signupData) => set({ signupData, isLoggedIn: false }),
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        signupData: state.signupData,
      }),
    }
  )
);
// logged in user profile

const useUserProfile = create(
  persist(
    (set) => ({
      userProfile: null,
      setUserProfile: (profileData) => set({ userProfile: profileData }),
      resetUserProfile: () => set({ userProfile: null }),
    }),
    {
      name: "user-profile-store",
    }
  )
);
const useSelectedUserStore = create((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
  resetSelectedUser: () => set({ selectedUser: null }),
}));


//show the add new users

const useAddUserStore = create(
  persist(
    (set) => ({
      selectedUsers: [],
      addUser: null,
      setAddUser: (user) => set({ addUser: user }),
      addToSelectedUsers: (user) =>
        set((state) => ({
          selectedUsers: [...state.selectedUsers, user],
        })),
    }),
    {
      name: "user-store", // localStorage key
    }
  )
);



//tping indicator

const useTypingIndicatorStore = create((set) => ({
  isTyping: false, // Local typing status
  theirTyping: false, // Their typing status
  currentChatId: null, // Track the currently active chat

  setIsTyping: (typing) => set({ isTyping: typing }),
  setTheirTyping: (theirTyping) => set({ theirTyping }),
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }), // Set active chat ID
}));

export { useUserStore, useSelectedUserStore , useUserProfile , useTypingIndicatorStore , useAddUserStore};
