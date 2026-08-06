"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/chat/conversation-list";
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
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col lg:-m-6 lg:h-[calc(100vh-4rem)] lg:flex-row">
      <div className="hidden w-72 shrink-0 lg:block">
        <ConversationList
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </div>
      <div className="min-w-0 flex-1 bg-surface-primary">
        <ChatWindow />
      </div>
    </div>
  );
}
