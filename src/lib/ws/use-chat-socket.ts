"use client";

import { useEffect } from "react";
import {
  disconnectSharedChatSocket,
  ensureSharedChatSocket,
  getSharedChatSocket,
  setChatFrameHandler,
  type ChatSendPayload,
} from "./chat-socket";
import { useSessionStore } from "@/stores/session-store";
import { useChatStore } from "@/stores/chat-store";
import type { WsFrame } from "@/types";

/** Whether a frame should update the open chat transcript. */
function frameTargetsActiveChat(conversationId: string | undefined): boolean {
  const { activeConversationId, streamingConversationId } = useChatStore.getState();

  if (streamingConversationId) {
    if (conversationId && conversationId !== streamingConversationId) return false;
    // Switched away while a turn was in flight — don't paint into the other chat
    if (activeConversationId && activeConversationId !== streamingConversationId) {
      return false;
    }
    return true;
  }

  if (activeConversationId) {
    return !conversationId || conversationId === activeConversationId;
  }

  return true;
}

function ensureAssistantForRequest(
  conversationId: string | undefined,
  requestId: string | undefined,
) {
  const store = useChatStore.getState();
  if (requestId) {
    const exists = store.messages.some(
      (m) => m.role === "assistant" && m.requestId === requestId && m.streaming,
    );
    if (!exists) {
      store.startAssistantMessage(conversationId, 0, requestId);
    }
    return;
  }
  if (!store.messages.some((m) => m.role === "assistant" && m.streaming)) {
    store.startAssistantMessage(conversationId);
  }
}

function handleChatFrame(frame: WsFrame) {
  const store = useChatStore.getState();
  const conversationId = frame.conversation_id;
  const requestId = frame.request_id;

  switch (frame.type) {
    case "chat.started": {
      if (!conversationId) break;
      store.bindStream(conversationId);
      if (!store.activeConversationId) {
        store.setActiveConversationId(conversationId);
      }
      store.upsertConversation({
        id: conversationId,
        title:
          store.conversations.find((c) => c.id === conversationId)?.title ??
          "New Conversation",
        status: "active",
      });
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/chat"
      ) {
        store.setPendingRouteConversationId(conversationId);
      }
      break;
    }
    case "chat.response": {
      if (!frameTargetsActiveChat(conversationId)) return;

      if (conversationId && !store.streamingConversationId) {
        store.bindStream(conversationId);
      }
      if (conversationId && !store.activeConversationId) {
        store.setActiveConversationId(conversationId);
      }

      ensureAssistantForRequest(conversationId, requestId);
      if (frame.response) store.appendStreamChunk(frame.response, requestId);
      break;
    }
    case "chat.done": {
      if (conversationId) {
        store.upsertConversation({
          id: conversationId,
          title:
            store.conversations.find((c) => c.id === conversationId)?.title ??
            "New Conversation",
          status: "active",
        });
      }

      if (frameTargetsActiveChat(conversationId)) {
        store.finalizeStream(
          conversationId,
          frame.chat_id,
          frame.continuation_key,
          requestId,
        );
        if (
          conversationId &&
          typeof window !== "undefined" &&
          window.location.pathname === "/chat"
        ) {
          store.setPendingRouteConversationId(conversationId);
        }
      } else if (
        conversationId &&
        conversationId === store.streamingConversationId
      ) {
        store.finalizeStream(
          conversationId,
          frame.chat_id,
          frame.continuation_key,
          requestId,
        );
      }
      break;
    }
    case "chat.title": {
      // Titles apply to any conversation (sidebar), not only the open one
      if (conversationId && frame.response) {
        store.updateTitle(conversationId, frame.response);
        store.upsertConversation({
          id: conversationId,
          title: frame.response,
          status: "active",
        });
      }
      break;
    }
    case "chat.error":
    case "error": {
      // Application error for this turn only — do not close the WebSocket.
      const message = frame.message ?? "Something went wrong. Please try again.";
      const targetConversation =
        conversationId ?? store.streamingConversationId ?? undefined;

      if (
        frameTargetsActiveChat(conversationId) ||
        (!conversationId && store.streamingConversationId)
      ) {
        store.failStream(message, targetConversation, requestId);
      } else if (
        targetConversation &&
        targetConversation === store.streamingConversationId
      ) {
        store.failStream(message, targetConversation, requestId);
      }
      break;
    }
    default:
      break;
  }
}

setChatFrameHandler(handleChatFrame);

/**
 * One WebSocket for the session. Conversations are scoped with `conversation_id`
 * on send/receive — never open a socket per chat.
 */
export function useChatSocket() {
  const token = useSessionStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      disconnectSharedChatSocket();
      return;
    }
    ensureSharedChatSocket(() => useSessionStore.getState().token);
  }, [token]);

  return {
    send: (payload: ChatSendPayload) => {
      const socket = ensureSharedChatSocket(() => useSessionStore.getState().token);
      socket?.send(payload);
    },
    reconnect: () => getSharedChatSocket()?.reconnectWithNewToken(),
  };
}

export { disconnectSharedChatSocket };
