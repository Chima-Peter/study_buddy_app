import { create } from "zustand";
import type { Document, DocumentStatus } from "@/types";

interface DocumentsState {
  items: Document[];
  nextCursor: string | null;
  hasMore: boolean;
  setPage: (items: Document[], nextCursor: string | null, hasMore: boolean, append?: boolean) => void;
  upsert: (doc: Document) => void;
  updateStatus: (id: string, status: DocumentStatus, comment?: string | null) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  items: [],
  nextCursor: null,
  hasMore: false,
  setPage: (items, nextCursor, hasMore, append = false) =>
    set((state) => ({
      items: append ? [...state.items, ...items] : items,
      nextCursor,
      hasMore,
    })),
  upsert: (doc) =>
    set((state) => {
      const idx = state.items.findIndex((d) => d.id === doc.id);
      if (idx === -1) return { items: [doc, ...state.items] };
      const next = [...state.items];
      next[idx] = { ...next[idx], ...doc };
      return { items: next };
    }),
  updateStatus: (id, status, comment) =>
    set((state) => ({
      items: state.items.map((d) =>
        d.id === id ? { ...d, status, comment: comment ?? d.comment } : d,
      ),
    })),
  remove: (id) => set((state) => ({ items: state.items.filter((d) => d.id !== id) })),
  reset: () => set({ items: [], nextCursor: null, hasMore: false }),
}));
