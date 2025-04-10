import { create } from "zustand";




const useUserStore = create((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}));


const useUserIdStore = create((set) => ({
  selectedUser: null,  
  setSelectedUser: (user) => set({ selectedUser: user}),  
  resetSelectedUser: () => set({ selectedUser: null }),  
}));

export { useUserStore, useUserIdStore };
