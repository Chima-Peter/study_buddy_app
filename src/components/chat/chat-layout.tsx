"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ConversationList } from "./conversation-list";

export function ChatLayout({
  children,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  children: React.ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setOpen(false);
    }
  }, [pathname]);

  return (
    <div className="relative -m-4 flex h-[calc(100vh-4rem)] overflow-hidden lg:-m-6">
      {open && (
        <button
          type="button"
          className="absolute inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close conversations"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-50 flex h-full shrink-0 flex-col border-r border-border bg-surface-secondary transition-[width,transform] duration-200",
          "absolute inset-y-0 left-0 w-72 lg:static lg:left-auto",
          open
            ? "translate-x-0 lg:w-72"
            : "-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:border-r-0",
        )}
      >
        <div className={cn("flex h-full w-72 flex-col", !open && "lg:invisible")}>
          <ConversationList
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            onCollapse={() => setOpen(false)}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-surface-primary">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <button
            type="button"
            className="flex min-touch items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
            aria-label={open ? "Hide conversations" : "Show conversations"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            {open ? "Hide history" : "Chat history"}
          </span>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
