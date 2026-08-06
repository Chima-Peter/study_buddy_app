"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, MessageSquareText } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { DocumentPicker } from "./document-picker";
import { useChatSocket } from "@/lib/ws/use-chat-socket";
import { routes } from "@/config/routes";

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  const prompts = [
    {
      title: "Summarize key concepts",
      description: "Get a clear overview from your materials.",
    },
    {
      title: "Explain simply",
      description: "Break down a tough topic in plain language.",
    },
    {
      title: "Quiz me",
      description: "Test what you’ve learned with quick questions.",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-center gap-4 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-xl space-y-4">
        <div className="chat-soft-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-800">
            <MessageSquareText className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">
              Ask your tutor
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              Tell us what you need and get answers grounded in your documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSuggest("Help me study the main ideas from my materials")}
            className="chat-soft-btn shrink-0 self-start sm:self-center"
          >
            Get started
          </button>
        </div>

        <ul className="space-y-3">
          {prompts.map((p) => (
            <li key={p.title}>
              <button
                type="button"
                onClick={() => onSuggest(p.title)}
                className="chat-soft-card flex w-full items-start gap-4 p-4 text-left transition-transform hover:-translate-y-0.5 sm:items-center sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-700/10 text-primary-800">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    {p.description}
                  </p>
                </div>
                <span className="chat-soft-btn hidden shrink-0 sm:inline-flex">
                  Try
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ChatWindow({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  const {
    messages,
    isStreaming,
    streamingConversationId,
    selectedDocumentIds,
    error,
    setError,
    appendUserMessage,
    prepareSend,
    setSelectedDocumentIds,
    activeConversationId,
    pendingRouteConversationId,
    setPendingRouteConversationId,
  } = useChatStore();
  const { send } = useChatSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  const viewingId = conversationId ?? activeConversationId;
  const streamingHere =
    isStreaming &&
    (!streamingConversationId || streamingConversationId === viewingId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingHere]);

  useEffect(() => {
    if (!pendingRouteConversationId) return;
    if (conversationId === pendingRouteConversationId) {
      setPendingRouteConversationId(null);
      return;
    }
    if (!conversationId) {
      const id = pendingRouteConversationId;
      setPendingRouteConversationId(null);
      router.replace(routes.chatConversation(id));
    }
  }, [
    pendingRouteConversationId,
    conversationId,
    router,
    setPendingRouteConversationId,
  ]);

  const onSend = (query: string) => {
    setError(null);
    appendUserMessage(query);
    const id = conversationId ?? activeConversationId ?? undefined;
    prepareSend(id ?? null);
    send({
      query,
      conversation_id: id,
      document_ids: selectedDocumentIds.length ? selectedDocumentIds : undefined,
    });
  };

  return (
    <div className="chat-soft-surface flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 ? (
          <EmptyState onSuggest={onSend} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {error && (
              <div
                className="chat-soft-card border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6 sm:pb-5">
        <div className="mx-auto max-w-2xl space-y-3">
          <DocumentPicker
            selectedIds={selectedDocumentIds}
            onChange={setSelectedDocumentIds}
          />
          <MessageInput disabled={streamingHere} onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
