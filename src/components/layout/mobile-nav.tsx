"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Library, MessageSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { UnreadBadge } from "@/components/notifications/unread-badge";

const tabs = [
  { href: routes.library, label: "Library", icon: Library },
  { href: routes.chat, label: "Chat", icon: MessageSquare },
  { href: routes.study, label: "Study", icon: BookOpen },
  { href: routes.notifications, label: "Inbox", icon: Bell },
  { href: routes.settings, label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface-secondary pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile"
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] min-touch",
              active ? "text-primary-700" : "text-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
            {tab.href === routes.notifications && (
              <span className="absolute right-1/4 top-1">
                <UnreadBadge compact />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
