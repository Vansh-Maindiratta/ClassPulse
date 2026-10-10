import { useEffect, useMemo, useState } from "react";
import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import type { AttendanceRecord, AttendanceSummary, ClassSession, User } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { AttendanceCard } from "../components/attendance/AttendanceCard";
import { Button } from "../components/ui/Button";
import { Field, Input, Select } from "../components/ui/Input";
import { ErrorState, LoadingState } from "../components/ui/States";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

export function Attendance() {
  const { session } = useDemo();
  const role = session!.role;

  if (role === "student") return <StudentAttendance />;
  if (role === "faculty") return <FacultyAttendance />;
  return <AdminAttendance />;
}

function StudentAttendance() {
  const { session } = useDemo();
  const user = session!.user;
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const summary = useApi(
    () => api.get<AttendanceSummary>(`/attendance/summary?student=${user._id}`),
    [user._id]
  );
  const history = useApi(
    () =>
      subjectId
        ? api.get<AttendanceRecord[]>(`/attendance?student=${user._id}&subject=${subjectId}`)
        : Promise.resolve([]),
    [user._id, subjectId]
  );

  const selected = summary.data?.bySubject.find((item) => item.subject.code === subjectId);

  if (summary.loading) return <LoadingState label="Loading attendance..." />;
  if (summary.error) return <ErrorState message={summary.error} onRetry={summary.reload} />;
  if (!summary.data?.bySubject.length) {
    return (
      <>
        <PageHeader title="Attendance" description="Your presence across classes." />
        <EmptyState title="No attendance records found." description="Records appear after faculty mark a session." />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="You can view records, but you cannot change them." />
      <StatCard
        label="Overall Attendance"
        value={`${summary.data.overall}%`}
        hint={`${summary.data.attended} of ${summary.data.total} classes`}
      />
      <Card>
        <div className="space-y-2">
          {summary.data.bySubject.map((item) => (
            <AttendanceCard
              key={item.subject._id}
              name={item.subject.name}
              percent={item.percent}
              onClick={() => setSubjectId(item.subject._id)}
            />
          ))}
        </div>
      </Card>

      {selected ? (
        <Card>
          <h2 className="font-medium">{selected.subject.name}</h2>
          <p className="mt-2 text-sm text-muted">
            Current attendance {selected.forecast.current}%. If you attend the next{" "}
            {selected.forecast.upcoming} classes, estimated attendance is {selected.forecast.estimated}%.
            This is an estimate.
          </p>
          {history.loading ? <p className="mt-4 text-sm text-muted">Loading history...</p> : null}
          <ul className="mt-4 divide-y divide-line">
            {history.data?.map((record) => (
              <li key={record._id} className="flex items-center justify-between py-3 text-sm">
                <span>{formatDay(record.date)}</span>
                <Badge tone={record.status === "present" ? "success" : "danger"}>{record.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className="text-sm text-muted">Select a subject to see attendance history.</p>
      )}
    </div>
  );
}

function FacultyAttendance() {
  const { session } = useDemo();
  const classes = useApi(
    () => api.get<ClassSession[]>(`/classes?faculty=${session!.user._id}`),
    [session!.user._id]
  );
  const roster = useApi(() => api.get<User[]>("/attendance/roster"), []);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selected = classes.data?.find((item) => item._id === classId) ?? classes.data?.[0];
  const subjectId = selected?.subject._id;

  const existing = useApi(
    () =>
      subjectId
        ? api.get<AttendanceRecord[]>(`/attendance?subject=${subjectId}`)
        : Promise.resolve([]),
    [subjectId]
  );

  useEffect(() => {
    if (!existing.data?.length) return;
    const forDay = existing.data.filter((record) => record.date.slice(0, 10) === date);
    if (!forDay.length) return;
    const next: Record<string, "present" | "absent"> = {};
    for (const record of forDay) {
      next[record.student._id] = record.status;
    }
    setMarks(next);
  }, [existing.data, date]);

  const students = roster.data ?? [];
  const effectiveMarks = useMemo(() => {
    const next: Record<string, "present" | "absent"> = {};
    for (const student of students) {
      next[student._id] = marks[student._id] ?? "present";
    }
    return { ...next, ...marks };
  }, [students, marks]);

  const presentCount = Object.values(effectiveMarks).filter((status) => status === "present").length;
  const absentCount = students.length - presentCount;

  async function save() {
    if (!subjectId) return;
    setSaving(true);
    setMessage("");
    try {
      await api.post("/attendance", {
        records: students.map((student) => ({
          student: student._id,
          subject: subjectId,
          date,
          status: effectiveMarks[student._id] || "present",
        })),
      });
      setMessage("Attendance saved.");
      void existing.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't save attendance.");
    } finally {
      setSaving(true);
    }
  }

  if (classes.loading || roster.loading) return <LoadingState label="Loading attendance..." />;
  if (classes.error) return <ErrorState message={classes.error} onRetry={classes.reload} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Mark attendance" description="Keep it simple: present or absent." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Class" htmlFor="class">
          <Select
            id="class"
            value={selected?._id || ""}
            onChange={(event) => {
              setClassId(event.target.value);
              setMarks({});
            }}
          >
            {classes.data?.map((item) => (
              <option key={item._id} value={item._id}>
                {item.subject.name} · {item.section}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date" htmlFor="date">
          <Input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            const all: Record<string, "present" | "absent"> = {};
            students.slice(0, 1).forEach((student) => {
              all[student._id] = "present";
            });
            setMarks((current) => ({ ...current, ...all }));
          }}
        >
          Mark All Present
        </Button>
        <p className="text-sm text-muted">
          Present: {presentCount} · Absent: {absentCount}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{student.name}</td>
                <td className="px-4 py-3">
                  <Select
                    className="w-auto min-w-32"
                    aria-label={`Attendance for ${student.name}`}
                    value={effectiveMarks[student._id]}
                    onChange={(event) =>
                      setMarks((current) => ({
                        ...current,
                        [student._id]: event.target.value as "present" | "absent",
                      }))
                    }
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save attendance"}
      </Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}

function AdminAttendance() {
  const summary = useApi(() => api.get<AttendanceSummary>("/attendance/summary"), []);
  if (summary.loading) return <LoadingState label="Loading attendance..." />;
  if (summary.error) return <ErrorState message={summary.error} onRetry={summary.reload} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance overview" />
      <StatCard label="Campus attendance" value={`${summary.data?.overall ?? 0}%`} />
      <Card>
        <div className="space-y-2">
          {summary.data?.bySubject.map((item) => (
            <AttendanceCard key={item.subject._id} name={item.subject.name} percent={item.percent} />
          ))}
        </div>
      </Card>
    </div>
  );
}
