"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { MessageQueue } from "./message-queue";
import { DocumentPicker } from "./document-picker";
import { useChatSocket } from "@/lib/ws/use-chat-socket";
import { createChatRequestId } from "@/lib/ws/chat-socket";
import { branchConversation } from "@/lib/api/conversations";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore } from "@/stores/chat-store";

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  const prompts = [
    "Summarize key concepts from my materials",
    "Explain a tough topic simply",
    "Quiz me on what I’ve learned",
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            What can I help with?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Ask questions grounded in your study documents.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSuggest(prompt)}
              className="rounded-full border border-black/[0.08] bg-panel px-3.5 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-black/[0.03] hover:text-[var(--text-primary)] dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    messages,
    messageQueue,
    isStreaming,
    streamingConversationId,
    selectedDocumentId,
    error,
    setError,
    setMessages,
    appendUserMessage,
    prepareSend,
    startAssistantMessage,
    setSelectedDocumentId,
    setActiveConversationId,
    activeConversationId,
    pendingRouteConversationId,
    setPendingRouteConversationId,
    upsertConversation,
    enqueueMessage,
    shiftQueuedMessage,
  } = useChatStore();
  const { send } = useChatSocket();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [promptSelect, setPromptSelect] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [branchingId, setBranchingId] = useState<string | null>(null);

  const viewingId = conversationId ?? activeConversationId;
  const streamingHere =
    isStreaming &&
    (!streamingConversationId || streamingConversationId === viewingId);
  const hasDocument = Boolean(selectedDocumentId);
  const docsRequiredMessage = "Select a document to send a message";
  const branching = Boolean(branchingId);
  // New chats have no id until chat.started — block extra sends until then.
  const canQueueWhileStreaming = Boolean(viewingId);
  const inputDisabled =
    branching || (streamingHere && !canQueueWhileStreaming);
  const conversationQueue = viewingId
    ? messageQueue.filter((item) => item.conversationId === viewingId)
    : [];

  const dispatchSend = (
    query: string,
    conversationIdForSend: string | undefined,
    documentId: string,
  ) => {
    const requestId = createChatRequestId();
    appendUserMessage(query, requestId);
    prepareSend(conversationIdForSend ?? null);
    startAssistantMessage(conversationIdForSend, 0, requestId);
    send({
      type: "chat",
      request_id: requestId,
      query,
      conversation_id: conversationIdForSend,
      document_id: documentId,
    });
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only stick to bottom if the user hasn't scrolled up.
    if (distanceFromBottom < 80) {
      bottomRef.current?.scrollIntoView({
        behavior: streamingHere ? "auto" : "smooth",
      });
    }
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

  // After chat.done (or stream failure), send the next queued follow-up.
  useEffect(() => {
    if (streamingHere || branching || !viewingId) return;
    // Guard against Strict Mode double-invoke / stale closures.
    if (useChatStore.getState().isStreaming) return;
    const next = shiftQueuedMessage(viewingId);
    if (!next) return;
    dispatchSend(next.content, viewingId, next.documentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flush only when streaming ends
  }, [streamingHere, branching, viewingId]);

  const requireDocument = () => {
    if (hasDocument) return true;
    setPickerOpen(true);
    setPromptSelect(true);
    return false;
  };

  const onDocumentChange = (id: string | null) => {
    setSelectedDocumentId(id);
    if (id) setPromptSelect(false);
  };

  const onSend = (query: string): boolean => {
    if (branching) return false;
    if (streamingHere && !canQueueWhileStreaming) return false;
    if (!requireDocument()) return false;
    setError(null);

    const id = conversationId ?? activeConversationId ?? undefined;

    // While a turn is in flight, hold follow-ups until chat.done.
    if (streamingHere && id) {
      enqueueMessage({
        content: query,
        conversationId: id,
        documentId: selectedDocumentId!,
      });
      return true;
    }

    dispatchSend(query, id, selectedDocumentId!);
    return true;
  };

  const onSuggest = (query: string) => {
    if (branching) return;
    if (streamingHere && !canQueueWhileStreaming) return;
    if (!requireDocument()) {
      setPrefill(query);
      setPrefillKey((k) => k + 1);
      return;
    }
    onSend(query);
  };

  const onRetry = (assistantMessageId: string) => {
    if (streamingHere || branching) return;
    const idx = messages.findIndex((m) => m.id === assistantMessageId);
    if (idx < 0) return;
    const assistant = messages[idx];
    if (assistant.role !== "assistant") return;
    const retries = assistant.retryCount ?? 0;
    if (retries >= 3) return;

    const continuationKey = assistant.continuationKey;
    if (!continuationKey) {
      setError("This message can’t be retried yet. Send a new message first.");
      return;
    }

    let userQuery: string | null = null;
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userQuery = messages[i].content;
        break;
      }
    }
    if (!userQuery) return;
    if (!requireDocument()) return;

    const requestId = createChatRequestId();
    setError(null);
    setMessages(messages.slice(0, idx));
    const id = conversationId ?? activeConversationId ?? undefined;
    prepareSend(id ?? null);
    startAssistantMessage(id, retries + 1, requestId);
    send({
      type: "retry",
      request_id: requestId,
      query: userQuery,
      conversation_id: id,
      document_id: selectedDocumentId!,
      continuation_key: continuationKey,
    });
  };

  const onEdit = (userMessageId: string, newQuery: string) => {
    if (streamingHere || branching) return;
    const trimmed = newQuery.trim();
    if (!trimmed) return;

    const idx = messages.findIndex((m) => m.id === userMessageId);
    if (idx < 0) return;
    const userMessage = messages[idx];
    if (userMessage.role !== "user") return;

    const continuationKey = userMessage.continuationKey;
    if (!continuationKey) {
      setError("This message can’t be edited yet. Send a new message first.");
      return;
    }
    if (!requireDocument()) return;

    const requestId = createChatRequestId();
    setError(null);
    setMessages([
      ...messages.slice(0, idx),
      { ...userMessage, content: trimmed, requestId },
    ]);
    const id = conversationId ?? activeConversationId ?? undefined;
    prepareSend(id ?? null);
    startAssistantMessage(id, 0, requestId);
    send({
      type: "edit",
      request_id: requestId,
      query: trimmed,
      conversation_id: id,
      document_id: selectedDocumentId!,
      continuation_key: continuationKey,
    });
  };

  const onBranch = async (assistantMessageId: string) => {
    if (streamingHere || branching) return;
    const idx = messages.findIndex((m) => m.id === assistantMessageId);
    if (idx < 0) return;
    const assistant = messages[idx];
    if (assistant.role !== "assistant") return;

    const continuationKey = assistant.continuationKey;
    if (!continuationKey) {
      setError("Save this chat first by sending a message, then try branching.");
      return;
    }

    setBranchingId(assistantMessageId);
    setError(null);
    try {
      const branched = await branchConversation(continuationKey);
      const chat = branched.chat;
      const key = chat.continuation_key || undefined;
      const title = branched.title?.trim() || "Branch";

      upsertConversation({
        id: branched.id,
        title,
        status: "active",
      });
      setActiveConversationId(branched.id);
      setMessages([
        {
          id: `${chat.id}-q`,
          role: "user",
          content: chat.query,
          continuationKey: key,
        },
        {
          id: `${chat.id}-a`,
          role: "assistant",
          content: chat.response,
          continuationKey: key,
        },
      ]);
      toast({ title: "Opened in a new chat", variant: "success" });
      router.push(routes.chatConversation(branched.id));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not branch into a new chat";
      setError(message);
      setBranchingId(null);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {branching && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-panel/80 backdrop-blur-[2px] dark:bg-surface-primary/70"
          role="status"
          aria-live="polite"
          aria-label="Creating branched chat"
        >
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-[var(--text-secondary)]">
            Opening new chat…
          </p>
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {messages.length === 0 ? (
          <EmptyState onSuggest={onSuggest} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-4 sm:px-6 sm:py-6">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onRetry={onRetry}
                onEdit={onEdit}
                onBranch={onBranch}
                actionsDisabled={streamingHere || branching}
                branching={branchingId === m.id}
              />
            ))}
            {error && (
              <div
                className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-gradient-to-t from-white via-white to-transparent px-4 pb-4 pt-2 dark:from-surface-primary dark:via-surface-primary sm:px-6 sm:pb-5">
        <div className="mx-auto max-w-3xl space-y-2.5">
          {conversationQueue.length > 0 && (
            <MessageQueue items={conversationQueue} />
          )}
          <DocumentPicker
            selectedId={selectedDocumentId}
            onChange={onDocumentChange}
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            promptSelect={promptSelect}
          />
          <MessageInput
            disabled={inputDisabled}
            onSend={onSend}
            prefill={prefill}
            prefillKey={prefillKey}
            placeholder={
              streamingHere && canQueueWhileStreaming
                ? "Add a follow-up…"
                : undefined
            }
            sendBlockedReason={hasDocument ? null : docsRequiredMessage}
          />
        </div>
      </div>
    </div>
  );
}
