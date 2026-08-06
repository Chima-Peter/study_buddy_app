"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatWindow } from "@/components/chat/chat-window";
import { listConversations } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { setConversations, nextCursor, hasMore, setSelectedDocumentIds, resetActive } =
    useChatStore();
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    resetActive();
    const docs = searchParams.get("docs");
    if (docs) setSelectedDocumentIds(docs.split(",").filter(Boolean));
    listConversations().then((data) => {
      setConversations(data.items, data.next_cursor, data.has_more);
    });
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

  return (
    <ChatLayout hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore}>
      <ChatWindow />
    </ChatLayout>
  );
}
