"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatWindow } from "@/components/chat/chat-window";
import { getConversation, listConversations } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { PageLoader } from "@/components/ui/spinner";
import { useChatSocket } from "@/lib/ws/use-chat-socket";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const {
    setConversations,
    setMessages,
    setActiveConversationId,
    nextCursor,
    hasMore,
  } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [list, detail] = await Promise.all([
          listConversations(),
          getConversation(params.conversationId),
        ]);
        if (cancelled) return;
        setConversations(list.items, list.next_cursor, list.has_more);
        setActiveConversationId(detail.id);
        const messages = detail.chats.flatMap((c) => [
          { id: `${c.id}-q`, role: "user" as const, content: c.query },
          { id: `${c.id}-a`, role: "assistant" as const, content: c.response },
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
    setConversations,
    setMessages,
    setActiveConversationId,
  ]);

  // Keep the single shared socket alive for this conversation view
  useChatSocket();

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await listConversations(nextCursor);
      setConversations(data.items, data.next_cursor, data.has_more, true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ChatLayout hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore}>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <PageLoader label="Loading conversation" />
        </div>
      ) : (
        <ChatWindow conversationId={params.conversationId} />
      )}
    </ChatLayout>
  );
}
