"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Library,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { UnreadBadge } from "@/components/notifications/unread-badge";
import { useLogout } from "@/lib/hooks/use-logout";

const nav = [
  { href: routes.library, label: "Library", icon: Library },
  { href: routes.chat, label: "Chat", icon: MessageSquare },
  { href: routes.study, label: "Study", icon: BookOpen },
  { href: routes.notifications, label: "Inbox", icon: Bell },
  { href: routes.settings, label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const handleLogout = useLogout();

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-surface-secondary lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-700 text-sm font-bold text-white">
          SB
        </div>
        <span className="text-lg font-semibold">
          Study<span className="text-primary-700">Buddy</span>
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-touch items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-500/15 text-primary-700"
                  : "text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.href === routes.notifications && <UnreadBadge />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full min-touch items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
