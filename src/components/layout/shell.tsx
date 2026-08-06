"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { useSse } from "@/lib/sse/use-sse";

export function Shell({ children }: { children: React.ReactNode }) {
  useSse();

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-primary">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="relative min-h-0 flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
