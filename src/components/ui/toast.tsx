"use client";

import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "default" | "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    root: string;
    iconWrap: string;
    Icon: typeof CheckCircle2;
  }
> = {
  default: {
    root: "border-border bg-surface-elevated",
    iconWrap: "bg-primary-500/10 text-primary-700",
    Icon: Info,
  },
  success: {
    root: "border-success/30 bg-surface-elevated",
    iconWrap: "bg-success/10 text-success-dark",
    Icon: CheckCircle2,
  },
  error: {
    root: "border-error/30 bg-surface-elevated",
    iconWrap: "bg-error/10 text-error-dark",
    Icon: CircleAlert,
  },
};

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
      <Toast.Provider swipeDirection="right" duration={5000}>
        {children}
        {items.map((item) => {
          const variant = item.variant ?? "default";
          const style = VARIANT_STYLES[variant];
          const Icon = style.Icon;

          return (
            <Toast.Root
              key={item.id}
              open
              duration={5000}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id);
              }}
              className={cn(
                "toast-slide-in relative flex items-center gap-3 overflow-hidden rounded-lg border px-3.5 py-3 shadow-md",
                style.root,
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  style.iconWrap,
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </span>

              <div className="min-w-0 flex-1 pr-1">
                <Toast.Title className="text-sm font-semibold leading-5 tracking-tight">
                  {item.title}
                </Toast.Title>
                {item.description && (
                  <Toast.Description className="mt-0.5 text-sm leading-5 text-[var(--text-secondary)]">
                    {item.description}
                  </Toast.Description>
                )}
              </div>

              <Toast.Close
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/[0.06] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </Toast.Close>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="fixed inset-x-4 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-[100] flex w-auto max-w-full flex-col gap-2 outline-none lg:inset-x-auto lg:right-4 lg:left-auto lg:w-[360px] lg:max-w-[calc(100vw-2rem)]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
