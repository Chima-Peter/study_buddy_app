"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Pencil, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { useChatStore } from "@/stores/chat-store";
import { renameConversation } from "@/lib/api/conversations";
import { Spinner } from "@/components/ui/spinner";

export function ConversationList({
  onLoadMore,
  hasMore,
  loadingMore,
  onCollapse,
}: {
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onCollapse?: () => void;
}) {
  const pathname = usePathname();
  const conversations = useChatStore((s) => s.conversations);
  const updateTitle = useChatStore((s) => s.updateTitle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const saveRename = async (id: string) => {
    const next = title.trim();
    if (!next) {
      setEditingId(null);
      return;
    }
    try {
      await renameConversation(id, next);
      updateTitle(id, next);
    } finally {
      setEditingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pt-3 pb-2">
        <Link
          href={routes.chat}
          onClick={onCollapse}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-black/[0.04] dark:hover:bg-white/10"
        >
          <SquarePen className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
          New chat
        </Link>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted">
            No conversations yet
          </p>
        ) : (
          conversations.map((c) => {
            const active = pathname === routes.chatConversation(c.id);
            return (
              <div
                key={c.id}
                className={cn(
                  "group relative rounded-lg transition-colors",
                  active
                    ? "bg-black/[0.06] dark:bg-white/10"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                )}
              >
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={title}
                    autoFocus
                    className="m-1 w-[calc(100%-0.5rem)] rounded-md border border-border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-primary-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-surface-elevated"
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => saveRename(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveRename(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-0.5">
                    <Link
                      href={routes.chatConversation(c.id)}
                      className={cn(
                        "min-h-9 min-w-0 flex-1 truncate px-3 py-2 text-sm",
                        active
                          ? "font-medium text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)]",
                      )}
                      onClick={onCollapse}
                    >
                      {c.title || "New chat"}
                    </Link>
                    <button
                      type="button"
                      className={cn(
                        "mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition",
                        "opacity-0 hover:bg-black/[0.06] hover:text-[var(--text-primary)] dark:hover:bg-white/10",
                        "group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
                        "[@media(hover:none)]:opacity-100",
                      )}
                      onClick={() => {
                        setEditingId(c.id);
                        setTitle(c.title ?? "");
                      }}
                      aria-label="Rename"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {hasMore && (
        <div className="px-2 pb-3">
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm text-[var(--text-secondary)] transition hover:bg-black/[0.04] hover:text-[var(--text-primary)] dark:hover:bg-white/10"
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore && <Spinner className="h-3.5 w-3.5" />}
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
