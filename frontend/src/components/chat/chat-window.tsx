"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { DocumentPicker } from "./document-picker";
import { useChatSocket } from "@/lib/ws/use-chat-socket";

export function ChatWindow({ conversationId }: { conversationId?: string }) {
  const {
    messages,
    isStreaming,
    selectedDocumentIds,
    error,
    setError,
    appendUserMessage,
    setSelectedDocumentIds,
    activeConversationId,
  } = useChatStore();
  const { send } = useChatSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const onSend = (query: string) => {
    setError(null);
    appendUserMessage(query);
    const id = conversationId ?? activeConversationId ?? undefined;
    send({
      query,
      conversation_id: id,
      document_ids: selectedDocumentIds.length ? selectedDocumentIds : undefined,
    });
  };

  return (
    <div className="flex h-full min-h-[60vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <h2 className="text-xl font-semibold">Ask your tutor</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Ground answers in your uploaded materials
              </p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {error && (
          <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="space-y-3 border-t border-border p-4">
        <DocumentPicker
          selectedIds={selectedDocumentIds}
          onChange={setSelectedDocumentIds}
        />
        <MessageInput disabled={isStreaming} onSend={onSend} />
      </div>
    </div>
  );
}
