"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: `${Date.now()}-${Math.random()}` }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right">
        {children}
        {items.map((item) => (
          <Toast.Root
            key={item.id}
            duration={4000}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((t) => t.id !== item.id));
            }}
            className={cn(
              "rounded-md border bg-surface-elevated p-4 shadow-lg data-[state=open]:animate-in",
              item.variant === "success" && "border-success",
              item.variant === "error" && "border-error",
              item.variant === "default" && "border-border",
            )}
          >
            <Toast.Title className="text-sm font-semibold">{item.title}</Toast.Title>
            {item.description && (
              <Toast.Description className="mt-1 text-sm text-[var(--text-secondary)]">
                {item.description}
              </Toast.Description>
            )}
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed right-4 top-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
