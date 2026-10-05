import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import type { Curriculum, TopicStatus } from "../../types";

const topicTone = {
  pending: "muted",
  "in-progress": "warning",
  completed: "success",
} as const;

function unitProgress(statusList: TopicStatus[]) {
  if (!statusList.length) return 0;
  const completed = statusList.filter((status) => status === "completed").length;
  return Math.round((completed / statusList.length) * 100);
}

interface Props {
  curriculum: Curriculum;
  editable?: boolean;
  onStatusChange?: (unitId: string, topicId: string, status: TopicStatus) => void;
}

export function CurriculumProgress({ curriculum, editable, onStatusChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">Overall Progress</p>
        <p className="mt-1 font-display text-3xl tabular-nums text-muted">{curriculum.progress}%</p>
        <div className="mt-3">
          <ProgressBar value={curriculum.progress} tone="info" />
        </div>
      </div>

      {curriculum.units.map((unit) => {
        const value = unitProgress(unit.topics.map((topic) => topic.status));
        return (
          <section key={unit._id} className="rounded-xl border border-line p-4">
            <ProgressBar value={value} label={unit.title} tone="info" />
            <ul className="mt-4 space-y-2">
              {unit.topics.map((topic) => (
                <li key={topic._id} className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    {topic.status === "completed" ? "✓" : topic.status === "in-progress" ? "◐" : "○"}{" "}
                    {topic.title}
                  </span>
                  {editable ? (
                    <select
                      aria-label={`Status for ${topic.title}`}
                      className="rounded-md border border-line bg-surface px-2 py-1 text-xs"
                      value={topic.status}
                      onChange={(event) =>
                        onStatusChange?.(unit._id, topic._id, event.target.value as TopicStatus)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <Badge tone={topicTone[topic.status]}>{topic.status.replace("-", " ")}</Badge>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
