"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";

export function useLogout() {
  const router = useRouter();
  const clearSession = useSessionStore((s) => s.clearSession);

  return async () => {
    try {
      await logout();
    } catch {
      // clear locally even if API fails
    }
    clearSession();
    router.replace(routes.login);
  };
}
