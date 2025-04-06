import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,  
  setUser: (userData) => set({ user: userData }),  
  resetUser: () => set({ user: null }),  
}));

const useUserIdStore = create((set) => ({
  selectedUser: null,  
  setSelectedUser: (user) => set({ user }),  
  resetSelectedUser: () => set({ user: null }),  
}));

export { useUserStore, useUserIdStore };
