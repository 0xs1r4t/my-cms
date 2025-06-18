import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
