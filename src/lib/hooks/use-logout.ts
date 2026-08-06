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
    try {
      await logout();
    } catch {
      // clear locally even if API fails
    }
    disconnectSharedChatSocket();
    clearSession();
    router.replace(routes.login);
  };
}
