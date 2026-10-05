import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import type { AttendanceSummary, Curriculum, StudentAttendanceStat } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar, attendanceTone } from "../components/ui/ProgressBar";
import { ErrorState, LoadingState } from "../components/ui/States";

const THRESHOLD = 75;

export function FacultyAnalytics() {
  const attendance = useApi(() => api.get<AttendanceSummary>("/attendance/summary"), []);
  const curriculum = useApi(() => api.get<Curriculum[]>("/curriculum"), []);
  const students = useApi(() => api.get<StudentAttendanceStat[]>("/attendance/students"), []);

  const curriculumAverage = useMemo(() => {
    const list = curriculum.data ?? [];
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, item) => sum + item.progress, 0) / list.length);
  }, [curriculum.data]);

  const loading = attendance.loading || curriculum.loading || students.loading;
  const error = attendance.error || curriculum.error || students.error;

  if (loading) return <LoadingState label="Loading analytics..." />;
  if (error) return <ErrorState message={error} onRetry={attendance.reload} />;

  const attendanceChart = (attendance.data?.bySubject ?? []).map((item) => ({
    name: item.subject.code,
    percent: item.percent,
  }));
  const curriculumChart = (curriculum.data ?? []).map((item) => ({
    name: item.subject.code,
    percent: item.progress,
  }));
  const attention = (students.data ?? []).filter((item) => item.belowThreshold);
  const hasCharts = attendanceChart.length > 0 || curriculumChart.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Attendance, curriculum, and students who need attention." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average Attendance"
          value={`${attendance.data?.overall ?? 0}%`}
          hint={`${attendance.data?.attended ?? 0} of ${attendance.data?.total ?? 0} sessions`}
        />
        <StatCard label="Curriculum Completion" value={`${curriculumAverage}%`} hint="Across all subjects" />
        <StatCard label="Students Tracked" value={students.data?.length ?? 0} />
        <StatCard label="Below Threshold" value={attention.length} hint={`Under ${THRESHOLD}% attendance`} />
      </div>

      {hasCharts ? (
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
      ) : (
        <EmptyState
          title="No analytics yet"
          description="Charts appear once attendance records and curriculum data exist."
        />
      )}

      <Card>
        <h2 className="mb-4 font-medium">Students needing attention</h2>
        {attention.length ? (
          <ul className="space-y-3">
            {attention.map((item) => (
              <li key={item.student._id}>
                <ProgressBar
                  value={item.percent}
                  label={`${item.student.name} · ${item.attended}/${item.total} sessions`}
                  tone={attendanceTone(item.percent)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nobody below the threshold"
            description={`Every tracked student is at or above ${THRESHOLD}% attendance.`}
          />
        )}
      </Card>
    </div>
  );
}
