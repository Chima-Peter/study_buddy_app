"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Plus, Pencil, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { useChatStore } from "@/stores/chat-store";
import { renameConversation } from "@/lib/api/conversations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="flex items-center justify-between gap-1 border-b border-border p-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <div className="flex items-center">
          <Link href={routes.chat}>
            <Button size="sm" variant="ghost" aria-label="New chat">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
          {onCollapse && (
            <button
              type="button"
              className="flex min-touch items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary"
              aria-label="Collapse conversations"
              onClick={onCollapse}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">
            No conversations yet
          </p>
        )}
        {conversations.map((c) => {
          const active = pathname === routes.chatConversation(c.id);
          return (
            <div
              key={c.id}
              className={cn(
                "group mb-1 rounded-md px-2 py-2",
                active ? "bg-primary-500/15" : "hover:bg-surface-tertiary",
              )}
            >
              {editingId === c.id ? (
                <Input
                  value={title}
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => saveRename(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveRename(c.id);
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={routes.chatConversation(c.id)}
                    className="min-w-0 flex-1 truncate text-sm"
                  >
                    {c.title}
                  </Link>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setEditingId(c.id);
                      setTitle(c.title);
                    }}
                    aria-label="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
