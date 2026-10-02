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

/** When Redis completion starts a queued turn, move it into the transcript. */
function promoteQueuedTurn(
  conversationId: string | undefined,
  requestId: string | undefined,
) {
  if (!requestId) return;
  const queued = useChatStore.getState().promoteQueuedMessage(requestId);
  if (!queued) return;

  const store = useChatStore.getState();
  const targetId = conversationId ?? queued.conversationId;
  if (!frameTargetsActiveChat(targetId)) return;

  const hasUser = store.messages.some(
    (m) => m.role === "user" && m.requestId === requestId,
  );
  if (!hasUser) {
    store.appendUserMessage(queued.content, requestId);
  }
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
      // Stay on /chat until chat.done so a refresh doesn't keep an empty id in the URL.
      break;
    }
    case "chat.response": {
      promoteQueuedTurn(conversationId, requestId);

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
      promoteQueuedTurn(conversationId, requestId);

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
      promoteQueuedTurn(conversationId, requestId);

      // Application error for this turn only — do not close the WebSocket.
      // Prefer `response` (agent) then `message` (service/router).
      const message =
        frame.response?.trim() ||
        frame.message?.trim() ||
        "Something went wrong. Please try again.";
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

      // Drop empty drafts that never got a saved turn into the sidebar list.
      if (targetConversation) {
        const listed = store.conversations.find((c) => c.id === targetConversation);
        const hasSavedTurn = store.messages.some(
          (m) => m.role === "assistant" && Boolean(m.continuationKey),
        );
        if (
          listed &&
          !hasSavedTurn &&
          (listed.title === "New Conversation" || !listed.title?.trim())
        ) {
          store.removeConversation(targetConversation);
        }
      }
      break;
    }
    case "queue.delete.success": {
      // Server removed the Redis item — drop the local mirror.
      if (requestId) store.removeQueuedMessage(requestId);
      break;
    }
    case "queue.delete.error": {
      // Leave the item in the local queue so the user can retry, or so
      // promoteQueuedTurn can pick it up if it already started processing.
      store.setError(
        frame.message?.trim() || "Could not remove queued message",
      );
      break;
    }
    case "queue.edit.success": {
      // Apply the full server-confirmed payload.
      if (requestId && typeof frame.query === "string") {
        store.updateQueuedMessage(
          requestId,
          frame.query,
          frame.document_id,
        );
      }
      break;
    }
    case "queue.edit.error": {
      store.setError(
        frame.message?.trim() || "Could not update queued message",
      );
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
