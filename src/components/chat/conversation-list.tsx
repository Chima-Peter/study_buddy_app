"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquare, Pencil, Plus } from "lucide-react";
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
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          History
        </h2>
        <Link
          href={routes.chat}
          onClick={onCollapse}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--text-secondary)] shadow-sm transition hover:text-[var(--text-primary)]"
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
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
                  "group relative rounded-xl transition-colors",
                  active
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/70",
                )}
              >
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={title}
                    autoFocus
                    className="m-1.5 w-[calc(100%-0.75rem)] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => saveRename(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveRename(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-1 px-1">
                    <Link
                      href={routes.chatConversation(c.id)}
                      className={cn(
                        "flex min-h-10 min-w-0 flex-1 items-center gap-2.5 truncate px-2.5 py-2.5 text-sm",
                        active
                          ? "font-medium text-primary-800"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                      )}
                      onClick={onCollapse}
                    >
                      <MessageSquare
                        className="h-3.5 w-3.5 shrink-0 opacity-60"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{c.title}</span>
                    </Link>
                    <button
                      type="button"
                      className={cn(
                        "mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition",
                        "opacity-0 hover:bg-black/[0.05] hover:text-[var(--text-primary)]",
                        "group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
                        "[@media(hover:none)]:opacity-100",
                      )}
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
            {loadingMore && <Spinner className="h-3.5 w-3.5" />}
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
