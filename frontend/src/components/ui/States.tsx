export function LoadingState({ label }: { label: string }) {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <p className="text-sm text-muted">{label}</p>
      <div className="h-24 animate-pulse rounded-xl bg-line/60" />
      <div className="h-24 animate-pulse rounded-xl bg-line/60" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
      <p className="text-sm text-warning">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-3 text-sm font-medium text-ink underline">
          Try again
        </button>
      ) : null}
    </div>
  );
}
