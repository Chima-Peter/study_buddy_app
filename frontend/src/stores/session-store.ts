import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/config/constants";

interface SessionState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
  getTokenExpiry: () => number | null;
}

function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearSession: () => set({ token: null, user: null }),
      setHydrated: (value) => set({ hydrated: value }),
      getTokenExpiry: () => {
        const token = get().token;
        return token ? decodeJwtExp(token) : null;
      },
    }),
    {
      name: "studybuddy-session",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (typeof window !== "undefined" && state?.token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, state.token);
          if (state.user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
          }
        }
      },
    },
  ),
);

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return useSessionStore.getState().token;
}
