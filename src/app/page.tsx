"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";
import { PageLoader } from "@/components/ui/spinner";
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
      <div className="flex min-h-dvh items-center justify-center bg-surface-primary">
        <PageLoader label="Loading StudyBuddy" />
      </div>
    );
  }

  if (token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-primary">
        <PageLoader label="Opening your library" />
      </div>
    );
  }

  return <LandingPage />;
}
