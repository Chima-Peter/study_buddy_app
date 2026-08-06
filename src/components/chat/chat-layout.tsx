"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { History, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

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
    <div className="relative -m-4 flex h-[calc(100%+2rem)] overflow-hidden lg:-m-6 lg:h-[calc(100%+3rem)]">
      {open && (
        <button
          type="button"
          className="absolute inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close conversations"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-50 flex h-full shrink-0 flex-col border-r border-border/70 bg-[#f4f7f6] transition-[width,transform] duration-200 dark:bg-surface-secondary",
          "absolute inset-y-0 left-0 w-[min(100%,18rem)] max-w-[85vw] lg:static lg:left-auto lg:w-64 lg:max-w-none",
          open
            ? "translate-x-0 lg:w-64"
            : "-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:border-r-0",
        )}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col lg:w-64",
            !open && "lg:invisible",
          )}
        >
          <ConversationList
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            onCollapse={() => setOpen(false)}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-[#eef3f1] dark:bg-surface-primary">
        <header className="flex h-14 shrink-0 items-center px-4 sm:px-5">
          <button
            type="button"
            className="chat-soft-btn gap-2"
            aria-label={open ? "Hide history" : "Show history"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <History className="h-4 w-4" />}
            <span>History</span>
          </button>
        </header>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
