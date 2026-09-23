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

function handleChatFrame(frame: WsFrame) {
  const store = useChatStore.getState();
  const conversationId = frame.conversation_id;

  switch (frame.type) {
    case "chat.response": {
      if (!frameTargetsActiveChat(conversationId)) return;

      if (conversationId && !store.streamingConversationId) {
        store.bindStream(conversationId);
      }
      if (conversationId && !store.activeConversationId) {
        store.setActiveConversationId(conversationId);
      }

      if (!store.isStreaming) store.startAssistantMessage(conversationId);
      if (frame.response) store.appendStreamChunk(frame.response);
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
        store.finalizeStream(conversationId, frame.chat_id);
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
        store.clearStreaming();
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
      if (!frameTargetsActiveChat(conversationId)) {
        if (conversationId && conversationId === store.streamingConversationId) {
          store.clearStreaming();
        }
        return;
      }
      store.setError(frame.message ?? "Chat error");
      store.finalizeStream(conversationId);
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
