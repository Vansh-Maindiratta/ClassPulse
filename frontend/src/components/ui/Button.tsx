import type { ButtonHTMLAttributes, ReactNode } from "react";

const styles = {
  primary:
    "bg-primary text-white hover:bg-primary-dark disabled:opacity-60",
  secondary:
    "bg-surface text-ink border border-line",
  ghost: "bg-transparent text-ink hover:bg-background",
  danger: "bg-danger text-white hover:bg-danger/90",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof styles;
  children: ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
