"use client";

import { useEffect, useRef } from "react";
import { ChatSocket } from "./chat-socket";
import { useSessionStore } from "@/stores/session-store";
import { useChatStore } from "@/stores/chat-store";

export function useChatSocket() {
  const token = useSessionStore((s) => s.token);
  const socketRef = useRef<ChatSocket | null>(null);
  const prevToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      prevToken.current = null;
      return;
    }

    const onFrame = (frame: {
      type: string;
      response?: string;
      message?: string;
      conversation_id?: string;
    }) => {
      const store = useChatStore.getState();

      switch (frame.type) {
        case "chat.response":
          if (!store.isStreaming) store.startAssistantMessage();
          if (frame.response) store.appendStreamChunk(frame.response);
          break;
        case "chat.done":
          store.finalizeStream(frame.conversation_id);
          if (frame.conversation_id) {
            store.upsertConversation({
              id: frame.conversation_id,
              title:
                store.conversations.find((c) => c.id === frame.conversation_id)?.title ??
                "New Conversation",
              status: "active",
            });
            store.setActiveConversationId(frame.conversation_id);
          }
          break;
        case "chat.title":
          if (frame.conversation_id && frame.response) {
            store.updateTitle(frame.conversation_id, frame.response);
            store.upsertConversation({
              id: frame.conversation_id,
              title: frame.response,
              status: "active",
            });
          }
          break;
        case "chat.error":
        case "error":
          store.setError(frame.message ?? "Chat error");
          store.finalizeStream(frame.conversation_id);
          break;
        default:
          break;
      }
    };

    if (!socketRef.current) {
      socketRef.current = new ChatSocket(
        () => useSessionStore.getState().token,
        onFrame,
      );
      socketRef.current.connect();
    } else if (prevToken.current && prevToken.current !== token) {
      socketRef.current.reconnectWithNewToken();
    }

    prevToken.current = token;

    return () => {
      // keep socket alive across chat route changes; disconnect on logout only
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (!useSessionStore.getState().token) {
        socketRef.current?.disconnect();
      }
    };
  }, []);

  return {
    send: (payload: {
      query: string;
      conversation_id?: string;
      document_ids?: string[];
    }) => socketRef.current?.send(payload),
    reconnect: () => socketRef.current?.reconnectWithNewToken(),
  };
}
