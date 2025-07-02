import { create } from "zustand";
import type { User, UserState, MediaState } from "@/utils/interfaces";

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useMediaStore = create<MediaState>((set) => ({
  refreshTrigger: 0,
  mediaItems: [],
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  setMediaItems: (items) => set({ mediaItems: items }),
  addMediaItem: (item) =>
    set((state) => ({
      mediaItems: [item, ...state.mediaItems],
    })),
  addMediaItems: (items) =>
    set((state) => ({
      mediaItems: [...items, ...state.mediaItems],
    })),
}));
