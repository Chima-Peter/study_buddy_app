"use client";

import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";
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

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="down" duration={5000}>
        {children}
        {items.map((item) => (
          <Toast.Root
            key={item.id}
            open
            duration={5000}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            className={cn(
              "toast-slide-in relative grid grid-cols-[1fr_auto] items-start gap-3 rounded-md border bg-surface-elevated p-4 shadow-lg",
              item.variant === "success" && "border-success",
              item.variant === "error" && "border-error",
              item.variant === "default" && "border-border",
            )}
          >
            <div className="min-w-0">
              <Toast.Title className="text-sm font-semibold">{item.title}</Toast.Title>
              {item.description && (
                <Toast.Description className="mt-1 text-sm text-[var(--text-secondary)]">
                  {item.description}
                </Toast.Description>
              )}
            </div>
            <Toast.Close
              className="flex min-touch shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[100] flex w-auto max-w-full flex-col gap-2 outline-none lg:inset-x-auto lg:bottom-auto lg:right-4 lg:top-4 lg:w-[360px] lg:max-w-[calc(100vw-2rem)]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
