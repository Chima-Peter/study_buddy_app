import { create } from "zustand";
import type { ConversationListItem } from "@/types";

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface ChatState {
  conversations: ConversationListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  activeConversationId: string | null;
  messages: UiMessage[];
  streamingContent: string;
  isStreaming: boolean;
  selectedDocumentIds: string[];
  error: string | null;
  setConversations: (
    items: ConversationListItem[],
    nextCursor: string | null,
    hasMore: boolean,
    append?: boolean,
  ) => void;
  upsertConversation: (item: ConversationListItem) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (messages: UiMessage[]) => void;
  appendUserMessage: (content: string) => void;
  startAssistantMessage: () => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: (conversationId?: string) => void;
  setSelectedDocumentIds: (ids: string[]) => void;
  setError: (error: string | null) => void;
  updateTitle: (id: string, title: string) => void;
  resetActive: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  nextCursor: null,
  hasMore: false,
  activeConversationId: null,
  messages: [],
  streamingContent: "",
  isStreaming: false,
  selectedDocumentIds: [],
  error: null,
  setConversations: (items, nextCursor, hasMore, append = false) =>
    set((state) => ({
      conversations: append ? [...state.conversations, ...items] : items,
      nextCursor,
      hasMore,
    })),
  upsertConversation: (item) =>
    set((state) => {
      const idx = state.conversations.findIndex((c) => c.id === item.id);
      if (idx === -1) return { conversations: [item, ...state.conversations] };
      const next = [...state.conversations];
      next[idx] = { ...next[idx], ...item };
      return { conversations: next };
    }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  appendUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: `u-${Date.now()}`, role: "user", content },
      ],
    })),
  startAssistantMessage: () =>
    set((state) => ({
      isStreaming: true,
      streamingContent: "",
      messages: [
        ...state.messages,
        { id: `a-${Date.now()}`, role: "assistant", content: "", streaming: true },
      ],
    })),
  appendStreamChunk: (chunk) =>
    set((state) => {
      const streamingContent = state.streamingContent + chunk;
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        messages[messages.length - 1] = { ...last, content: streamingContent };
      }
      return { streamingContent, messages };
    }),
  finalizeStream: (conversationId) =>
    set((state) => {
      const messages = state.messages.map((m) =>
        m.streaming ? { ...m, streaming: false } : m,
      );
      return {
        messages,
        isStreaming: false,
        streamingContent: "",
        activeConversationId: conversationId ?? state.activeConversationId,
      };
    }),
  setSelectedDocumentIds: (ids) => set({ selectedDocumentIds: ids }),
  setError: (error) => set({ error }),
  updateTitle: (id, title) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c,
      ),
    })),
  resetActive: () =>
    set({
      activeConversationId: null,
      messages: [],
      streamingContent: "",
      isStreaming: false,
      error: null,
    }),
}));
