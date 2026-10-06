"use client";

import { useEffect, useState } from "react";
import { listMemories } from "@/lib/api/memories";
import { MemoryBubbles } from "@/components/settings/memory-bubbles";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PageLoader, Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import type { Memory } from "@/types";

export default function MemoriesSettingsPage() {
  const [items, setItems] = useState<Memory[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listMemories();
        if (cancelled) return;
        setItems(data.items);
        setNextCursor(data.next_cursor);
        setHasMore(data.has_more);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await listMemories({ cursor: nextCursor });
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Memory"
        description="StudyBuddy uses these memories to personalize your chats. Only you can see them."
        showBack
        backHref={routes.settings}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <PageLoader label="Loading memories" />
        </div>
      ) : (
        <MemoryBubbles
          items={items}
          emptyMessage="No memories yet. Chat with StudyBuddy and memories will show up here."
        />
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={loadMore}
            disabled={loadingMore}
            className="text-[var(--text-secondary)]"
          >
            {loadingMore && <Spinner className="h-3.5 w-3.5" />}
            {loadingMore ? "Loading…" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
}
