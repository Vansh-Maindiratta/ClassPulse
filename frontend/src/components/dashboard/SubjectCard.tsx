import { BookOpen } from "lucide-react";
import { ProgressBar } from "../ui/ProgressBar";
import type { Subject } from "../../types";

interface Props {
  subject: Subject;
  meta?: string;
  progress?: number;
  onClick?: () => void;
}

export function SubjectCard({ subject, meta, progress, onClick }: Props) {
  const facultyName =
    typeof subject.faculty === "object" ? subject.faculty.name : undefined;

  const content = (
    <>
      <div className="mb-3 flex items-center gap-2 text-primary">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide uppercase">{subject.code}</span>
      </div>
      <h3 className="font-medium">{subject.name}</h3>
      <p className="mt-1 text-sm text-muted">{meta || facultyName}</p>
      {progress != null ? (
        <div className="mt-4">
          <ProgressBar value={progress} tone="warning" />
        </div>
      ) : null}
    </>
  );

  if (!onClick) {
    return <article className="rounded-xl border border-line bg-surface p-4">{content}</article>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-primary/30"
    >
      {content}
    </button>
  );
}
