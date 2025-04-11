'use client'


import{ create} from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      signupData: null,

      
      setUser: (userData) => set({ user: userData, isLoggedIn: true }),

    
      resetUser: () => set({ user: null, isLoggedIn: false }),

      
      setSignupData: (signupData) =>
        set({ signupData, isLoggedIn: false }),
    }),
    {
      name: 'user-store', 
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