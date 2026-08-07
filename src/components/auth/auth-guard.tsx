"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";
import { PageLoader } from "@/components/ui/spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSessionStore((s) => s.token);
  const hydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(routes.login);
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <PageLoader label="Checking your session" />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
