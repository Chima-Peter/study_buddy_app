"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";
import { disconnectSharedChatSocket } from "@/lib/ws/chat-socket";

export function useLogout() {
  const router = useRouter();
  const clearSession = useSessionStore((s) => s.clearSession);

  return async () => {
    // Tear down live connections before invalidating the session server-side.
    disconnectSharedChatSocket();
    try {
      await logout();
    } catch {
      // clear locally even if API fails
    }
    clearSession();
    router.replace(routes.login);
  };
}
