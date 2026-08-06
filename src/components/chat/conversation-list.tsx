"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { useChatStore } from "@/stores/chat-store";
import { renameConversation } from "@/lib/api/conversations";

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
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">History</h2>
        <div className="flex items-center gap-1">
          <Link
            href={routes.chat}
            onClick={onCollapse}
            className="chat-soft-btn"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
          </Link>
          {onCollapse && (
            <button
              type="button"
              className="chat-soft-btn lg:hidden"
              aria-label="Close"
              onClick={onCollapse}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {conversations.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted">
            No conversations yet
          </p>
        ) : (
          conversations.map((c) => {
            const active = pathname === routes.chatConversation(c.id);
            return (
              <div
                key={c.id}
                className={cn(
                  "chat-soft-card",
                  active && "ring-1 ring-primary-600/25",
                )}
              >
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={title}
                    autoFocus
                    className="m-2 w-[calc(100%-1rem)] rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary-600"
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => saveRename(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveRename(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <div className="flex items-center px-1">
                    <Link
                      href={routes.chatConversation(c.id)}
                      className={cn(
                        "min-h-11 min-w-0 flex-1 truncate px-3 py-3 text-sm",
                        active
                          ? "font-semibold text-primary-800"
                          : "text-[var(--text-primary)]",
                      )}
                      onClick={onCollapse}
                    >
                      {c.title}
                    </Link>
                    <button
                      type="button"
                      className="flex min-touch shrink-0 items-center justify-center px-2 text-muted hover:text-[var(--text-primary)]"
                      onClick={() => {
                        setEditingId(c.id);
                        setTitle(c.title);
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
        <div className="px-3 pb-4">
          <button
            type="button"
            className="chat-soft-btn w-full justify-center"
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
