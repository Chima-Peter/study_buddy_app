"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const TabsContext = createContext<{
  value: string;
  onChange: (value: string) => void;
} | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const onChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsList must be inside Tabs");

  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const active = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!active) return;
      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
      });
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(list);
    return () => resizeObserver.disconnect();
  }, [ctx.value, children]);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(
        "relative flex w-full items-stretch gap-0 border-b border-border",
        className,
      )}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 h-0.5 bg-primary-700"
        initial={false}
        animate={{
          left: indicator.left,
          width: indicator.width,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      />
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be inside Tabs");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "relative z-[1] px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "text-primary-800"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be inside Tabs");

  if (ctx.value !== value) return null;

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
