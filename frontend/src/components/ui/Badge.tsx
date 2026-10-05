const tones = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  muted: "bg-background text-muted",
};

interface Props {
  children: string;
  tone?: keyof typeof tones;
}

export function Badge({ children, tone = "muted" }: Props) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}
