"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
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
          className="absolute inset-0 z-40 bg-black/20 lg:hidden"
          aria-label="Close conversations"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-50 flex h-full shrink-0 flex-col border-r border-black/[0.06] bg-[#f7f7f8] transition-[width,transform] duration-200 dark:border-white/10 dark:bg-surface-secondary",
          "absolute inset-y-0 left-0 w-[min(100%,17rem)] max-w-[85vw] lg:static lg:left-auto lg:w-60 lg:max-w-none",
          open
            ? "translate-x-0 lg:w-60"
            : "-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:border-r-0",
        )}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col lg:w-60",
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

      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-surface-primary">
        <header className="flex h-12 shrink-0 items-center px-3 sm:px-4">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-black/[0.04] hover:text-[var(--text-primary)] dark:hover:bg-white/10"
            aria-label={open ? "Hide history" : "Show history"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
