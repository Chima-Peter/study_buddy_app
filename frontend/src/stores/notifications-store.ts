import { create } from "zustand";
import type { Notification } from "@/types";

interface NotificationsState {
  items: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
  setPage: (
    items: Notification[],
    nextCursor: string | null,
    hasMore: boolean,
    append?: boolean,
  ) => void;
  prepend: (item: Notification) => void;
  markRead: (ids: string[]) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  nextCursor: null,
  hasMore: false,
  unreadCount: 0,
  setPage: (items, nextCursor, hasMore, append = false) =>
    set((state) => {
      const merged = append ? [...state.items, ...items] : items;
      const unreadCount = merged.filter((n) => !n.read_at).length;
      return { items: merged, nextCursor, hasMore, unreadCount };
    }),
  prepend: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      unreadCount: item.read_at ? state.unreadCount : state.unreadCount + 1,
    })),
  markRead: (ids) =>
    set((state) => {
      const now = new Date().toISOString();
      const items = state.items.map((n) =>
        ids.includes(n.id) && !n.read_at ? { ...n, read_at: now } : n,
      );
      return {
        items,
        unreadCount: items.filter((n) => !n.read_at).length,
      };
    }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  reset: () => set({ items: [], nextCursor: null, hasMore: false, unreadCount: 0 }),
}));
