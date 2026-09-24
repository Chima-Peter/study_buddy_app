"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, MessageSquareText } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { DocumentPicker } from "./document-picker";
import { useChatSocket } from "@/lib/ws/use-chat-socket";
import { branchConversation } from "@/lib/api/conversations";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/api/client";

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
    setMessages,
    appendUserMessage,
    prepareSend,
    startAssistantMessage,
    setSelectedDocumentIds,
    setActiveConversationId,
    activeConversationId,
    pendingRouteConversationId,
    setPendingRouteConversationId,
    upsertConversation,
  } = useChatStore();
  const { send } = useChatSocket();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [promptSelect, setPromptSelect] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [branching, setBranching] = useState(false);

  const viewingId = conversationId ?? activeConversationId;
  const streamingHere =
    isStreaming &&
    (!streamingConversationId || streamingConversationId === viewingId);
  const hasDocuments = selectedDocumentIds.length > 0;
  const docsRequiredMessage = "Select at least one document to send a message";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingHere]);

  useEffect(() => {
    if (!streamingHere) return;
    const id = window.setInterval(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 80);
    return () => window.clearInterval(id);
  }, [streamingHere]);

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

  const requireDocuments = () => {
    if (hasDocuments) return true;
    setPickerOpen(true);
    setPromptSelect(true);
    return false;
  };

  const onDocumentsChange = (ids: string[]) => {
    setSelectedDocumentIds(ids);
    if (ids.length > 0) setPromptSelect(false);
  };

  const onSend = (query: string) => {
    if (!requireDocuments()) return;
    setError(null);
    appendUserMessage(query);
    const id = conversationId ?? activeConversationId ?? undefined;
    prepareSend(id ?? null);
    startAssistantMessage(id);
    send({
      type: "chat",
      query,
      conversation_id: id,
      document_ids: selectedDocumentIds,
    });
  };

  const onSuggest = (query: string) => {
    if (!requireDocuments()) {
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
    if (!requireDocuments()) return;

    setError(null);
    setMessages(messages.slice(0, idx));
    const id = conversationId ?? activeConversationId ?? undefined;
    prepareSend(id ?? null);
    startAssistantMessage(id, retries + 1);
    send({
      type: "retry",
      query: userQuery,
      conversation_id: id,
      document_ids: selectedDocumentIds,
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
    if (!requireDocuments()) return;

    setError(null);
    setMessages([
      ...messages.slice(0, idx),
      { ...userMessage, content: trimmed },
    ]);
    const id = conversationId ?? activeConversationId ?? undefined;
    prepareSend(id ?? null);
    startAssistantMessage(id);
    send({
      type: "edit",
      query: trimmed,
      conversation_id: id,
      document_ids: selectedDocumentIds,
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

    let userContent = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userContent = messages[i].content;
        break;
      }
    }
    if (!userContent) {
      setError("Could not find the question for this reply.");
      return;
    }

    setBranching(true);
    setError(null);
    try {
      const branched = await branchConversation(continuationKey);
      const title = branched.title?.trim() || "Branch";
      upsertConversation({
        id: branched.id,
        title,
        status: branched.status,
      });
      setActiveConversationId(branched.id);
      setMessages([
        {
          id: `${branched.chat_id}-q`,
          role: "user",
          content: userContent,
          continuationKey: branched.continuation_key,
        },
        {
          id: `${branched.chat_id}-a`,
          role: "assistant",
          content: assistant.content,
          continuationKey: branched.continuation_key,
        },
      ]);
      router.push(routes.chatConversation(branched.id));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not branch into a new chat";
      setError(message);
    } finally {
      setBranching(false);
    }
  };

  return (
    <div className="chat-soft-surface flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 ? (
          <EmptyState onSuggest={onSuggest} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onRetry={onRetry}
                onEdit={onEdit}
                onBranch={onBranch}
                actionsDisabled={streamingHere || branching}
              />
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
            onChange={onDocumentsChange}
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            promptSelect={promptSelect}
          />
          <MessageInput
            disabled={streamingHere}
            onSend={onSend}
            prefill={prefill}
            prefillKey={prefillKey}
            sendBlockedReason={hasDocuments ? null : docsRequiredMessage}
          />
        </div>
      </div>
    </div>
  );
}
