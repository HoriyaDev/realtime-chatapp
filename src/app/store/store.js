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

const useAddUserStore = create((set) => ({
  addUser: null,
  setAddUser: (user) => set({ addUser: user }),
  selectedUsers: [],
  addToSelectedUsers: (user) =>
    set((state) => ({
      selectedUsers: [...state.selectedUsers, user],
    })),
}));




//tping indicator

const useTypingIndicatorStore = create((set) => ({
isTyping: false,
theirTyping:false,

setIsTyping: (typing) => set({ isTyping:typing }),
setTheirTyping: (theirTyping) => set({ theirTyping }),


}))

export { useUserStore, useSelectedUserStore , useUserProfile , useTypingIndicatorStore , useAddUserStore};
