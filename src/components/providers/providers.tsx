"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { THEME_STORAGE_KEY } from "@/config/constants";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as "dark" | "light" | "system" | null;
    // Default to light (white + green). Only dark when explicitly chosen.
    let resolved: "dark" | "light" = "light";
    if (stored === "dark") resolved = "dark";
    else if (stored === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      resolved = "light";
      if (!stored) localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
