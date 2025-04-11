'use client'


import{ create} from "zustand";
 
 
 const useUserStore = create((set) => ({
   user: null,  
   setUser: (userData) => set({ user: userData }),  
   resetUser: () => set({ user: null }),  
 }));
 
 export default useUserStore;
 const useSelectedUserStore = create((set) => ({
   selectedUser: null,  
   setSelectedUser: (user) => set({ selectedUser: user }),  
   resetSelectedUser: () => set({ selectedUser: null }),  
 }));
 
 export { useUserStore,useSelectedUserStore };