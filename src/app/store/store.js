import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useUserStore = create(
  devtools(
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
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          isLoggedIn: state.isLoggedIn,
          signupData: state.signupData,
        }),
      }
    )
  )
);

const useSelectedUserStore = create(
  devtools( // Use devtools here as well
    (set) => ({
      selectedUser: null,
      setSelectedUser: (user) => set({ selectedUser: user }),
      resetSelectedUser: () => set({ selectedUser: null }),
    })
  )
);


const useChatStore = create((set, get) => ({
  chats: {}, // object to store input for each chat
  setInput: (chatId, input) => set((state) => {
    const chats = { ...state.chats, [chatId]: { ...state.chats[chatId], input } };
    return { chats };
  }),
  getInput: (chatId) => {
    const state = get(); // Access the latest state using get()
    return state.chats[chatId]?.input || ''; // Return input for a specific chat, or an empty string if not found
  },
}));
const useTypingIndicatorStore = create(
  devtools( // Devtools on typing store
    (set) => ({
      isTyping: false,
      theirTyping: false,
      currentChatId: null,
      setIsTyping: (typing) => set({ isTyping: typing }),
      setTheirTyping: (theirTyping) => set({ theirTyping }),
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
    })
  )
);

export { useUserStore, useSelectedUserStore, useTypingIndicatorStore, useChatStore };
