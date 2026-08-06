"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Shell } from "@/components/layout/shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Shell>{children}</Shell>
    </AuthGuard>
  );
}
