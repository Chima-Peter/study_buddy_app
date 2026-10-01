import { create } from "zustand";
import type { ConversationListItem } from "@/types";

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  /** How many times this assistant turn has been retried (max 3). */
  retryCount?: number;
  /** Signed key from the server for edit/retry of this turn. */
  continuationKey?: string;
  /** Client request_id used to correlate WS frames for this turn. */
  requestId?: string;
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
  selectedDocumentId: string | null;
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
  appendUserMessage: (content: string, requestId?: string) => void;
  prepareSend: (conversationId: string | null) => void;
  bindStream: (conversationId: string) => void;
  startAssistantMessage: (
    conversationId?: string,
    retryCount?: number,
    requestId?: string,
  ) => void;
  appendStreamChunk: (chunk: string, requestId?: string) => void;
  finalizeStream: (
    conversationId?: string,
    chatId?: string,
    continuationKey?: string,
    requestId?: string,
  ) => void;
  /** End the in-flight assistant turn after an error; keep the WS open. */
  failStream: (
    message: string,
    conversationId?: string,
    requestId?: string,
  ) => void;
  clearStreaming: () => void;
  setPendingRouteConversationId: (id: string | null) => void;
  setSelectedDocumentId: (id: string | null) => void;
  setError: (error: string | null) => void;
  updateTitle: (id: string, title: string) => void;
  resetActive: () => void;
}

function findStreamingAssistantIndex(
  messages: UiMessage[],
  requestId?: string,
): number {
  if (requestId) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (
        message.role === "assistant" &&
        message.streaming &&
        message.requestId === requestId
      ) {
        return i;
      }
    }
  }
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "assistant" && message.streaming) return i;
  }
  return -1;
}

function hasStreamingMessages(messages: UiMessage[]) {
  return messages.some((m) => m.streaming);
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
  selectedDocumentId: null,
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
  appendUserMessage: (content, requestId) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `u-${Date.now()}-${requestId ?? "local"}`,
          role: "user",
          content,
          requestId,
        },
      ],
    })),
  prepareSend: (conversationId) =>
    set({
      isStreaming: true,
      streamingConversationId: conversationId,
      error: null,
    }),
  bindStream: (conversationId) =>
    set({ streamingConversationId: conversationId }),
  startAssistantMessage: (conversationId, retryCount = 0, requestId) =>
    set((state) => ({
      isStreaming: true,
      streamingContent: "",
      streamingConversationId: conversationId ?? state.streamingConversationId,
      messages: [
        ...state.messages,
        {
          id: `a-${Date.now()}-${requestId ?? "local"}`,
          role: "assistant",
          content: "",
          streaming: true,
          retryCount,
          requestId,
        },
      ],
    })),
  appendStreamChunk: (chunk, requestId) =>
    set((state) => {
      const messages = [...state.messages];
      const idx = findStreamingAssistantIndex(messages, requestId);
      if (idx < 0) return state;
      const message = messages[idx];
      const content = message.content + chunk;
      messages[idx] = { ...message, content };
      return {
        messages,
        streamingContent: content,
        isStreaming: true,
      };
    }),
  finalizeStream: (conversationId, chatId, continuationKey, requestId) =>
    set((state) => {
      const messages = [...state.messages];
      const assistantIdx = findStreamingAssistantIndex(messages, requestId);

      if (assistantIdx >= 0) {
        const assistant = messages[assistantIdx];
        const resolvedRequestId = requestId ?? assistant.requestId;
        messages[assistantIdx] = {
          ...assistant,
          id: chatId ? `${chatId}-a` : assistant.id,
          streaming: false,
          continuationKey: continuationKey ?? assistant.continuationKey,
          requestId: resolvedRequestId,
        };

        for (let i = assistantIdx - 1; i >= 0; i--) {
          const message = messages[i];
          if (message.role !== "user") continue;
          const matchesRequest =
            resolvedRequestId && message.requestId === resolvedRequestId;
          const matchesTemp =
            !resolvedRequestId &&
            (message.id.startsWith("u-") ||
              (chatId != null && message.id === `${chatId}-q`));
          if (matchesRequest || matchesTemp) {
            messages[i] = {
              ...message,
              id: chatId ? `${chatId}-q` : message.id,
              continuationKey: continuationKey ?? message.continuationKey,
              requestId: resolvedRequestId ?? message.requestId,
            };
            break;
          }
        }
      } else if (chatId) {
        // Fallback: older single-stream finalize path
        const userId = `${chatId}-q`;
        const assistantId = `${chatId}-a`;
        for (let i = messages.length - 1; i >= 0; i--) {
          const message = messages[i];
          if (message.role === "assistant" && message.streaming) {
            messages[i] = {
              ...message,
              id: assistantId,
              streaming: false,
              continuationKey: continuationKey ?? message.continuationKey,
            };
            continue;
          }
          if (
            message.role === "user" &&
            (message.id.startsWith("u-") || message.id === userId)
          ) {
            messages[i] = {
              ...message,
              id: userId,
              continuationKey: continuationKey ?? message.continuationKey,
            };
            break;
          }
        }
      }

      const stillStreaming = hasStreamingMessages(messages);
      return {
        messages,
        isStreaming: stillStreaming,
        streamingContent: stillStreaming ? state.streamingContent : "",
        streamingConversationId: stillStreaming
          ? (conversationId ?? state.streamingConversationId)
          : null,
        activeConversationId: conversationId ?? state.activeConversationId,
      };
    }),
  failStream: (message, conversationId, requestId) =>
    set((state) => {
      const messages = [...state.messages];
      const assistantIdx = findStreamingAssistantIndex(messages, requestId);
      const note = message.trim() || "Something went wrong. Please try again.";

      if (assistantIdx >= 0) {
        const assistant = messages[assistantIdx];
        messages[assistantIdx] = {
          ...assistant,
          content: assistant.content.trim()
            ? `${assistant.content.trim()}\n\n⚠️ ${note}`
            : `⚠️ ${note}`,
          streaming: false,
        };
      }

      const stillStreaming = hasStreamingMessages(messages);
      return {
        messages,
        error: note,
        isStreaming: stillStreaming,
        streamingContent: stillStreaming ? state.streamingContent : "",
        streamingConversationId: stillStreaming
          ? (conversationId ?? state.streamingConversationId)
          : null,
      };
    }),
  clearStreaming: () =>
    set((state) => ({
      isStreaming: false,
      streamingContent: "",
      streamingConversationId: null,
      messages: state.messages.map((m) =>
        m.streaming ? { ...m, streaming: false } : m,
      ),
    })),
  setPendingRouteConversationId: (id) => set({ pendingRouteConversationId: id }),
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
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
