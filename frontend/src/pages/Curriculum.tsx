import { useState } from "react";
import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import type { Curriculum, TopicStatus } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { CurriculumProgress } from "../components/curriculum/CurriculumProgress";
import { SubjectCard } from "../components/dashboard/SubjectCard";
import { ErrorState, LoadingState } from "../components/ui/States";
import { EmptyState } from "../components/ui/EmptyState";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

export function CurriculumPage() {
  const { session } = useDemo();
  const role = session!.role;
  const list = useApi(() => api.get<Curriculum[]>("/curriculum"), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (list.loading) return <LoadingState label="Loading curriculum..." />;
  if (list.error) return <ErrorState message={list.error} onRetry={list.reload} />;
  if (!list.data?.length) {
    return (
      <EmptyState
        title="No curriculum yet"
        description="Subjects will show topic progress once faculty add units."
      />
    );
  }

  const mine =
    role === "faculty"
      ? list.data.filter((item) => {
          const faculty = item.subject.faculty;
          const id = typeof faculty === "object" ? faculty._id : faculty;
          return id === session!.user._id;
        })
      : list.data;

  const selected = mine.find((item) => item._id === selectedId) ?? mine[0];
  const overall = Math.round(mine.reduce((sum, item) => sum + item.progress, 0) / mine.length);

  async function updateTopic(unitId: string, topicId: string, status: TopicStatus) {
    if (!selected) return;
    const units = selected.units.map((unit) =>
      unit._id !== unitId
        ? unit
        : {
            ...unit,
            topics: unit.topics.map((topic) => (topic._id === topicId ? { ...topic, status } : topic)),
          }
    );
    await api.put(`/curriculum/${selected._id}`, { units });
    await list.reload();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum"
        description={role === "faculty" ? "Update topic status as you teach." : "See what has been covered."}
      />
      <Card>
        <p className="text-sm text-muted">Overall Curriculum</p>
        <p className="mt-1 font-display text-3xl">{overall}%</p>
        <div className="mt-3">
          <ProgressBar value={overall} tone="info" />
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {mine.map((item) => (
          <SubjectCard
            key={item._id}
            subject={item.subject}
            progress={item.progress}
            onClick={() => setSelectedId(item.subject._id)}
          />
        ))}
      </div>
      {selected ? (
        <Card>
          <h2 className="mb-4 font-medium">{selected.subject.name}</h2>
          <CurriculumProgress
            curriculum={selected}
            editable={role === "faculty"}
            onStatusChange={updateTopic}
          />
        </Card>
      ) : null}
    </div>
  );
}
