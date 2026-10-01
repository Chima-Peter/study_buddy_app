"use client";

import { useEffect, useState } from "react";
import { ChatLayout } from "./chat-layout";
import { listConversations } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useChatSocket } from "@/lib/ws/use-chat-socket";
import { PageLoader } from "@/components/ui/spinner";

/**
 * Shared shell for /chat and /chat/[id] so the history panel keeps its open
 * state across conversation navigations (avoids open/close flicker).
 */
export function ChatShell({ children }: { children: React.ReactNode }) {
  const { setConversations, nextCursor, hasMore } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useChatSocket();

  useEffect(() => {
    let cancelled = false;
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
  }, [setConversations]);

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
      {children}
    </ChatLayout>
  );
}
