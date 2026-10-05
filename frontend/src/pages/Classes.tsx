import { Link } from "react-router-dom";
import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import type { ClassSession, User } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState, LoadingState } from "../components/ui/States";

export function FacultyClasses() {
  const { session } = useDemo();
  const user = session!.user;
  const classes = useApi(() => api.get<ClassSession[]>(`/classes?faculty=${user._id}`), [user._id]);
  const students = useApi(() => api.get<User[]>("/users?role=student"), []);

  if (classes.loading || students.loading) return <LoadingState label="Loading your classes..." />;
  if (classes.error) return <ErrorState message={classes.error} onRetry={classes.reload} />;
  if (students.error) return <ErrorState message={students.error} onRetry={students.reload} />;

  const studentCount = students.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Classes" description="The classes you teach this term." />

      {classes.data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.data.map((item) => (
            <Card key={item._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">
                    {item.subject.code}
                  </p>
                  <h2 className="mt-1 font-medium">{item.subject.name}</h2>
                </div>
                <Badge tone="info">{item.section}</Badge>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Room</dt>
                  <dd>{item.room}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Schedule</dt>
                  <dd className="text-right">
                    {item.schedule.days.join(", ")} · {item.schedule.time}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Students</dt>
                  <dd>{studentCount}</dd>
                </div>
              </dl>
              <Link
                to="/faculty/students"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                View students →
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No classes assigned"
          description="Classes assigned to you appear here once an administrator creates them."
        />
      )}
    </div>
  );
}
