import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: Props) {
  return (
    <section
      className={`rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(31,27,22,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}
