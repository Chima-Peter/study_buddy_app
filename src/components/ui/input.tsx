"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, disabled, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              error ? "text-error" : "text-[var(--text-secondary)]",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-md border bg-surface-tertiary px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-muted transition-colors",
              "focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500",
              error ? "border-error" : "border-border",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isPassword && "pr-10",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
