// store.js
import{ create} from "zustand";

const useUserStore = create((set) => ({
  user: null,  
  setUser: (userData) => set({ user: userData }),  
  resetUser: () => set({ user: null }),  
}));

export default useUserStore;
