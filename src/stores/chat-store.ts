import { create } from "zustand";
import type { ConversationListItem } from "@/types";

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  /** How many times this assistant turn has been retried (max 3). */
  retryCount?: number;
}

interface ChatState {
  conversations: ConversationListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  activeConversationId: string | null;
  /** Conversation the current WS turn belongs to (set on send / first frame). */
  streamingConversationId: string | null;
  /** After creating a chat on /chat, navigate to /chat/[id]. */
  pendingRouteConversationId: string | null;
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
  prepareSend: (conversationId: string | null) => void;
  bindStream: (conversationId: string) => void;
  startAssistantMessage: (conversationId?: string, retryCount?: number) => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: (
    conversationId?: string,
    messageIds?: { queryMessageId?: string; responseMessageId?: string },
  ) => void;
  clearStreaming: () => void;
  setPendingRouteConversationId: (id: string | null) => void;
  setSelectedDocumentIds: (ids: string[]) => void;
  setError: (error: string | null) => void;
  updateTitle: (id: string, title: string) => void;
  resetActive: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  nextCursor: null,
  hasMore: false,
  activeConversationId: null,
  streamingConversationId: null,
  pendingRouteConversationId: null,
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
  prepareSend: (conversationId) =>
    set({
      streamingConversationId: conversationId,
      error: null,
    }),
  bindStream: (conversationId) =>
    set({ streamingConversationId: conversationId }),
  startAssistantMessage: (conversationId, retryCount = 0) =>
    set((state) => ({
      isStreaming: true,
      streamingContent: "",
      streamingConversationId: conversationId ?? state.streamingConversationId,
      messages: [
        ...state.messages,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "",
          streaming: true,
          retryCount,
        },
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
  finalizeStream: (conversationId, messageIds) =>
    set((state) => {
      const messages = [...state.messages];
      if (messageIds?.queryMessageId || messageIds?.responseMessageId) {
        for (let i = messages.length - 1; i >= 0; i--) {
          const message = messages[i];
          if (
            messageIds.responseMessageId &&
            message.role === "assistant" &&
            message.streaming
          ) {
            messages[i] = {
              ...message,
              id: messageIds.responseMessageId,
              streaming: false,
            };
            continue;
          }
          if (
            messageIds.queryMessageId &&
            message.role === "user" &&
            message.id.startsWith("u-")
          ) {
            messages[i] = { ...message, id: messageIds.queryMessageId };
            break;
          }
        }
      }
      return {
        messages: messages.map((m) =>
          m.streaming ? { ...m, streaming: false } : m,
        ),
        isStreaming: false,
        streamingContent: "",
        streamingConversationId: null,
        activeConversationId: conversationId ?? state.activeConversationId,
      };
    }),
  clearStreaming: () =>
    set({
      isStreaming: false,
      streamingContent: "",
      streamingConversationId: null,
    }),
  setPendingRouteConversationId: (id) => set({ pendingRouteConversationId: id }),
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
      pendingRouteConversationId: null,
      messages: [],
      streamingContent: "",
      isStreaming: false,
      streamingConversationId: null,
      error: null,
    }),
}));
