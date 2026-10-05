import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import type { ClassSession, Subject } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { SubjectCard } from "../components/dashboard/SubjectCard";
import { ErrorState, LoadingState } from "../components/ui/States";

export function Subjects() {
  const { session } = useDemo();
  const subjects = useApi(() => api.get<Subject[]>("/subjects"), []);
  const classes = useApi(() => api.get<ClassSession[]>("/classes"), []);

  if (subjects.loading) return <LoadingState label="Loading subjects..." />;
  if (subjects.error) return <ErrorState message={subjects.error} onRetry={subjects.reload} />;

  const list =
    session!.role === "faculty"
      ? (subjects.data ?? []).filter((subject) => {
          const facultyId = typeof subject.faculty === "object" ? subject.faculty._id : subject.faculty;
          return facultyId === session!.user._id;
        })
      : subjects.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={session!.role === "faculty" ? "My Subjects" : "Subjects"}
        description="The papers that make up this term."
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {list.map((subject) => {
          const cls = classes.data?.find((item) => item.subject._id === subject._id);
          return (
            <SubjectCard
              key={subject._id}
              subject={subject}
              meta={cls ? `${cls.section} · ${cls.room} · ${cls.schedule.time}` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
