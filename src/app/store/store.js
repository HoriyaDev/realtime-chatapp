import { create } from "zustand";
import { persist } from 'zustand/middleware';

const useUserStore = create(persist(
  (set) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
    clearUser: () => set({ user: null }),
  }),
  {
    name: 'user-storage', // The key in localStorage
    getStorage: () => localStorage, // Specify where to store the data
  }
));

const useUserIdStore = create((set) => ({
  selectedUser: null,  
  setSelectedUser: (user) => set({ selectedUser: user}),  
  resetSelectedUser: () => set({ selectedUser: null }),  
}));

export { useUserStore, useUserIdStore };
