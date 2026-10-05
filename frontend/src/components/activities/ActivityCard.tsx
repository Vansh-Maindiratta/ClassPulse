import { Badge } from "../ui/Badge";
import type { Activity } from "../../types";

const typeTone = {
  assignment: "info",
  quiz: "warning",
  lab: "info",
  project: "info",
  seminar: "muted",
  tutorial: "muted",
} as const;

const statusTone = {
  pending: "warning",
  submitted: "info",
  completed: "success",
  overdue: "warning",
} as const;

export function formatDue(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

export function ActivityCard({
  activity,
  onClick,
}: {
  activity: Activity;
  onClick?: () => void;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{activity.title}</h3>
          <p className="mt-1 text-sm text-muted">{activity.subject.name}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={typeTone[activity.type]}>{activity.type}</Badge>
          <Badge tone={statusTone[activity.status]}>{activity.status}</Badge>
        </div>
      </div>
      {activity.description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{activity.description}</p>
      ) : null}
      <p className="mt-3 text-sm">
        Due: <span className="font-medium">{formatDue(activity.dueDate)}</span>
      </p>
      {onClick ? (
        <button onClick={onClick} className="mt-3 text-sm font-medium text-primary">
          Edit activity
        </button>
      ) : null}
    </article>
  );
}
