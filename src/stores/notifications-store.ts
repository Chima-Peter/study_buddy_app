import { create } from "zustand";
import type { Notification } from "@/types";

interface NotificationsState {
  items: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
  pendingReadIds: string[];
  setPage: (
    items: Notification[],
    nextCursor: string | null,
    hasMore: boolean,
    append?: boolean,
  ) => void;
  prepend: (item: Notification) => void;
  markRead: (ids: string[]) => void;
  queueRead: (id: string) => void;
  consumePendingReads: () => string[];
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  nextCursor: null,
  hasMore: false,
  unreadCount: 0,
  pendingReadIds: [],
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
      const idSet = new Set(ids);
      const items = state.items.map((n) =>
        idSet.has(n.id) && !n.read_at ? { ...n, read_at: now } : n,
      );
      return {
        items,
        unreadCount: items.filter((n) => !n.read_at).length,
        pendingReadIds: state.pendingReadIds.filter((id) => !idSet.has(id)),
      };
    }),
  queueRead: (id) =>
    set((state) => {
      const item = state.items.find((n) => n.id === id);
      if (!item || item.read_at || state.pendingReadIds.includes(id)) return state;
      const now = new Date().toISOString();
      const items = state.items.map((n) =>
        n.id === id ? { ...n, read_at: now } : n,
      );
      return {
        items,
        pendingReadIds: [...state.pendingReadIds, id],
        unreadCount: items.filter((n) => !n.read_at).length,
      };
    }),
  consumePendingReads: () => {
    const ids = get().pendingReadIds;
    if (ids.length) set({ pendingReadIds: [] });
    return ids;
  },
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  reset: () =>
    set({ items: [], nextCursor: null, hasMore: false, unreadCount: 0, pendingReadIds: [] }),
}));
