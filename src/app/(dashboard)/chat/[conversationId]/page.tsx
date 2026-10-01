"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";
import { getConversation } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { PageLoader } from "@/components/ui/spinner";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const { setMessages, setActiveConversationId, upsertConversation } =
    useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const detail = await getConversation(params.conversationId);
        if (cancelled) return;
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
