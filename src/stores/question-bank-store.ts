import { create } from "zustand";
import type { QuestionBank } from "@/types";

interface QuestionBankState {
  items: QuestionBank[];
  nextCursor: string | null;
  hasMore: boolean;
  current: QuestionBank | null;
  setPage: (
    items: QuestionBank[],
    nextCursor: string | null,
    hasMore: boolean,
    append?: boolean,
  ) => void;
  upsert: (bank: QuestionBank) => void;
  remove: (documentId: string) => void;
  setCurrent: (bank: QuestionBank | null) => void;
  reset: () => void;
}

export const useQuestionBankStore = create<QuestionBankState>((set) => ({
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
  upsert: (bank) =>
    set((state) => {
      const idx = state.items.findIndex((b) => b.document_id === bank.document_id);
      if (idx === -1) return { items: [bank, ...state.items], current: bank };
      const next = [...state.items];
      next[idx] = { ...next[idx], ...bank };
      return {
        items: next,
        current:
          state.current?.document_id === bank.document_id
            ? { ...state.current, ...bank }
            : state.current,
      };
    }),
  remove: (documentId) =>
    set((state) => ({
      items: state.items.filter((b) => b.document_id !== documentId),
      current:
        state.current?.document_id === documentId ? null : state.current,
    })),
  setCurrent: (bank) => set({ current: bank }),
  reset: () => set({ items: [], nextCursor: null, hasMore: false, current: null }),
}));
