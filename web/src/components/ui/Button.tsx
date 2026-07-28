import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium rounded border border-transparent transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]";

    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:opacity-90",
      secondary: "bg-secondary text-secondary-foreground border-border hover:bg-accent",
      success: "bg-emerald-600 text-white hover:bg-emerald-700",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-mono",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
