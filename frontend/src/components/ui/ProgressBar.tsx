interface Props {
  value: number;
  label?: string;
  tone?: "success" | "warning" | "danger" | "info";
}

const bar = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export function attendanceTone(value: number) {
  if (value >= 75) return "success" as const;
  if (value >= 65) return "warning" as const;
  return "danger" as const;
}

export function ProgressBar({ value, label, tone = "info" }: Props) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
          <span>{label}</span>
          <span className="tabular-nums text-muted">{width}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full transition-all duration-300 ${bar[tone]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
