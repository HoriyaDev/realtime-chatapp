'use client'


import{ create} from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      signupData: null,

      // Set user after login
      setUser: (userData) => set({ user: userData, isLoggedIn: true }),

      // Reset user
      resetUser: () => set({ user: null, isLoggedIn: false }),

      // Set signup data
      setSignupData: (signupData) =>
        set({ signupData, isLoggedIn: false }),
    }),
    {
      name: 'user-store', // key name in localStorage
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        signupData: state.signupData,
      }),
    }
  )
);
 

 const useSelectedUserStore = create((set) => ({
   selectedUser: null,  
   setSelectedUser: (user) => set({ selectedUser: user }),  
   resetSelectedUser: () => set({ selectedUser: null }),  
 }));
 
 export { useUserStore,useSelectedUserStore };