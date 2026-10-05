"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";
import { getConversation } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { PageLoader } from "@/components/ui/spinner";
import { routes } from "@/config/routes";

/** True when this conversation’s transcript is already in the client store. */
function hasLiveTranscript(conversationId: string) {
  const state = useChatStore.getState();
  return (
    state.activeConversationId === conversationId && state.messages.length > 0
  );
}

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const {
    setMessages,
    setActiveConversationId,
    upsertConversation,
    removeConversation,
    setPendingRouteConversationId,
  } = useChatStore();
  // Skip the loading gate when navigating after a finished stream / branch.
  const [loading, setLoading] = useState(
    () => !hasLiveTranscript(params.conversationId),
  );

  useEffect(() => {
    let cancelled = false;

    // Post-stream handoff (and branch) already hydrated the store — don't refetch.
    if (hasLiveTranscript(params.conversationId)) {
      const state = useChatStore.getState();
      if (state.pendingRouteConversationId === params.conversationId) {
        setPendingRouteConversationId(null);
      }
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const detail = await getConversation(params.conversationId);
        if (cancelled) return;

        if (detail.chats.length === 0) {
          const state = useChatStore.getState();
          // Keep the page open for the in-flight first turn; otherwise drop
          // empty drafts so they don't linger in the sidebar / URL.
          const keepOpen =
            state.activeConversationId === detail.id ||
            state.streamingConversationId === detail.id ||
            state.pendingRouteConversationId === detail.id ||
            (state.isStreaming && state.messages.length > 0);
          if (!keepOpen) {
            removeConversation(detail.id);
            router.replace(routes.chat);
            return;
          }
          setActiveConversationId(detail.id);
          return;
        }

        setActiveConversationId(detail.id);

        upsertConversation({
          id: detail.id,
          title: detail.title?.trim() || "New Conversation",
          status: "active",
        });
        const messages = detail.chats.flatMap((c) => [
          {
            id: `${c.id}-q`,
            role: "user" as const,
            content: c.query,
            continuationKey: c.continuation_key ?? undefined,
          },
          {
            id: `${c.id}-a`,
            role: "assistant" as const,
            content: c.response,
            continuationKey: c.continuation_key ?? undefined,
          },
        ]);
        setMessages(messages);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    params.conversationId,
    setMessages,
    setActiveConversationId,
    upsertConversation,
    removeConversation,
    setPendingRouteConversationId,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <PageLoader label="Loading conversation" />
      </div>
    );
  }

  return <ChatWindow conversationId={params.conversationId} />;
}
