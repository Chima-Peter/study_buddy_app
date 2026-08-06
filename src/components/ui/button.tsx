import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 min-touch",
  {
    variants: {
      variant: {
        primary: "bg-primary-700 text-white hover:bg-primary-800 active:scale-[0.98]",
        secondary:
          "border border-primary-700 text-primary-700 hover:bg-primary-500/10 active:scale-[0.98]",
        ghost: "text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]",
        danger: "bg-error text-white hover:bg-error-dark active:scale-[0.98]",
        success: "bg-success text-white hover:bg-success-dark active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
