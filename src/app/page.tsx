"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const router = useRouter();
  const token = useSessionStore((s) => s.token);
  const hydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? routes.library : routes.login);
  }, [hydrated, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
