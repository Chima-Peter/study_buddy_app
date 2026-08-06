"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { useSse } from "@/lib/sse/use-sse";

export function Shell({ children }: { children: React.ReactNode }) {
  useSse();

  return (
    <div className="flex min-h-screen bg-surface-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-6">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
