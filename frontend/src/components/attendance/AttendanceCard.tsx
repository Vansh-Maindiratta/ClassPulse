import { attendanceTone, ProgressBar } from "../ui/ProgressBar";

interface Props {
  name: string;
  percent: number;
  onClick?: () => void;
}

export function AttendanceCard({ name, percent, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-transparent p-2 text-left hover:border-line hover:bg-background"
    >
      <ProgressBar value={percent} label={name} tone={attendanceTone(percent)} />
    </button>
  );
}
