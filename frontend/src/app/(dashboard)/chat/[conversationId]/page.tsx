"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { getConversation, listConversations } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { Spinner } from "@/components/ui/spinner";

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
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col lg:-m-6 lg:flex-row">
      <div className="hidden w-72 shrink-0 lg:block">
        <ConversationList
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </div>
      <div className="min-w-0 flex-1 bg-surface-primary">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <ChatWindow conversationId={params.conversationId} />
        )}
      </div>
    </div>
  );
}
