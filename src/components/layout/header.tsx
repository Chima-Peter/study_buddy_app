"use client";

import Link from "next/link";
import { Bell, LogOut, Settings } from "lucide-react";
import { routes } from "@/config/routes";
import { useSessionStore } from "@/stores/session-store";
import { UnreadBadge } from "@/components/notifications/unread-badge";
import { useLogout } from "@/lib/hooks/use-logout";

export function Header() {
  const user = useSessionStore((s) => s.user);
  const handleLogout = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface-secondary/90 px-4 backdrop-blur lg:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm text-[var(--text-secondary)]">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={routes.notifications}
          className="relative flex min-touch items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1">
            <UnreadBadge compact />
          </span>
        </Link>
        <Link
          href={routes.settings}
          className="flex min-touch items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex min-touch items-center justify-center gap-2 rounded-md px-2 py-2 text-sm text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-700">
          {(user?.name?.[0] ?? "S").toUpperCase()}
        </div>
      </div>
    </header>
  );
}
