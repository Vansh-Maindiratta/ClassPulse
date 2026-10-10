import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import type { Activity, AttendanceSummary, ClassSession, Curriculum, Subject, User } from "../types";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { ErrorState, LoadingState } from "../components/ui/States";

const pieColors = ["#2f6f4e", "#9a6700", "#9b2c2c"];

export function AdminDashboard() {
  const users = useApi(() => api.get<User[]>("/users"), []);
  const subjects = useApi(() => api.get<Subject[]>("/subjects"), []);
  const classes = useApi(() => api.get<ClassSession[]>("/classes"), []);
  const attendance = useApi(() => api.get<AttendanceSummary>("/attendance/summary"), []);
  const curriculum = useApi(() => api.get<Curriculum[]>("/curriculum"), []);
  const activities = useApi(() => api.get<Activity[]>("/activities"), []);

  const students = users.data?.filter((user) => user.role === "faculty") ?? [];
  const faculty = users.data?.filter((user) => user.role === "faculty") ?? [];

  const attendanceChart = attendance.data?.bySubject.map((item) => ({
    name: item.subject.code,
    percent: item.percent,
  }));

  const curriculumChart = curriculum.data?.map((item) => ({
    name: item.subject.code,
    percent: item.progress,
  }));

  const activityPie = useMemo(() => {
    const list = activities.data ?? [];
    const completed = list.filter((item) => item.status === "completed" || item.status === "submitted").length;
    const overdue = list.filter((item) => item.status === "overdue").length;
    const pending = list.filter((item) => item.status === "pending").length;
    const total = list.length || 1;
    return [
      { name: "Completed", value: Math.round((completed / total) * 100) },
      { name: "Pending", value: Math.round((pending / total) * 100) },
      { name: "Overdue", value: Math.round((overdue / total) * 100) },
    ];
  }, [activities.data]);

  const loading =
    users.loading ||
    subjects.loading ||
    classes.loading ||
    attendance.loading ||
    curriculum.loading ||
    activities.loading;
  const error =
    users.error ||
    subjects.error ||
    classes.error ||
    attendance.error ||
    curriculum.error ||
    activities.error;

  if (loading) return <LoadingState label="Loading campus overview..." />;
  if (error) return <ErrorState message={error} onRetry={users.reload} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Campus overview</h1>
        <p className="mt-6 text-muted">A snapshot of people, classes, and academic progress.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={students.length} />
        <StatCard label="Faculty" value={faculty.length} />
        <StatCard label="Subjects" value={subjects.data?.length ?? 0} />
        <StatCard label="Active Classes" value={classes.data?.length ?? 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium">Attendance by subject</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart}>
                <CartesianGrid stroke="#ddd6c8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="percent" fill="#215c4e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Curriculum completion</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={curriculumChart}>
                <CartesianGrid stroke="#ddd6c8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="percent" fill="#255ea8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-medium">Activity completion</h2>
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activityPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72}>
                  {activityPie.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 text-sm">
            {activityPie.map((item, index) => (
              <li key={item.name} className="flex justify-between border-b border-line py-2">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[index] }} />
                  {item.name}
                </span>
                <span className="tabular-nums">{item.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
