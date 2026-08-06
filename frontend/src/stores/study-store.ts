import { create } from "zustand";
import type { StudyCards } from "@/types";

interface StudyState {
  items: StudyCards[];
  nextCursor: string | null;
  hasMore: boolean;
  current: StudyCards | null;
  setPage: (
    items: StudyCards[],
    nextCursor: string | null,
    hasMore: boolean,
    append?: boolean,
  ) => void;
  upsert: (deck: StudyCards) => void;
  setCurrent: (deck: StudyCards | null) => void;
  reset: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  items: [],
  nextCursor: null,
  hasMore: false,
  current: null,
  setPage: (items, nextCursor, hasMore, append = false) =>
    set((state) => ({
      items: append ? [...state.items, ...items] : items,
      nextCursor,
      hasMore,
    })),
  upsert: (deck) =>
    set((state) => {
      const idx = state.items.findIndex((d) => d.document_id === deck.document_id);
      if (idx === -1) return { items: [deck, ...state.items], current: deck };
      const next = [...state.items];
      next[idx] = { ...next[idx], ...deck };
      return {
        items: next,
        current:
          state.current?.document_id === deck.document_id
            ? { ...state.current, ...deck }
            : state.current,
      };
    }),
  setCurrent: (deck) => set({ current: deck }),
  reset: () => set({ items: [], nextCursor: null, hasMore: false, current: null }),
}));
