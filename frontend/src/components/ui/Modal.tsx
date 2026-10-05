import { useEffect, type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ title, children, onClose }: Props) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <button className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-line bg-surface p-5 shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-display text-xl">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted hover:bg-background"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
