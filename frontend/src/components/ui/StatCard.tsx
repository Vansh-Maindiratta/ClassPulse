interface Props {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatCard({ label, value, hint }: Props) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
      {hint ? <p className="mt-1 hidden text-sm text-muted sm:block">{hint}</p> : null}
    </article>
  );
}
