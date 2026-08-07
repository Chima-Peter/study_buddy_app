"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatWindow } from "@/components/chat/chat-window";
import { PageLoader } from "@/components/ui/spinner";
import { listConversations } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useChatSocket } from "@/lib/ws/use-chat-socket";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { setConversations, nextCursor, hasMore, setSelectedDocumentIds, resetActive } =
    useChatStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useChatSocket();

  useEffect(() => {
    let cancelled = false;
    resetActive();
    const docs = searchParams.get("docs");
    if (docs) setSelectedDocumentIds(docs.split(",").filter(Boolean));
    setLoading(true);
    listConversations()
      .then((data) => {
        if (cancelled) return;
        setConversations(data.items, data.next_cursor, data.has_more);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, setConversations, setSelectedDocumentIds, resetActive]);

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

  if (loading) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center">
        <PageLoader label="Loading conversations" />
      </div>
    );
  }

  return (
    <ChatLayout hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore}>
      <ChatWindow />
    </ChatLayout>
  );
}
