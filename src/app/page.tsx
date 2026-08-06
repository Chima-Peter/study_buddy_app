"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/spinner";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  const router = useRouter();
  const token = useSessionStore((s) => s.token);
  const hydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (token) router.replace(routes.library);
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-primary">
        <Spinner className="h-8 w-8 text-primary-700" />
      </div>
    );
  }

  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-primary">
        <Spinner className="h-8 w-8 text-primary-700" />
      </div>
    );
  }

  return <LandingPage />;
}
