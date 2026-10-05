import { useEffect, useState } from "react";
import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { getFacultyInsight } from "../services/ai";
import { todayLabel } from "../data/demoData";
import type {
  Activity,
  AttendanceSummary,
  ClassSession,
  Curriculum,
  StudentAttendanceStat,
  Subject,
  User,
} from "../types";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { AIInsightCard } from "../components/ui/AIInsightCard";
import { ErrorState, LoadingState } from "../components/ui/States";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar, attendanceTone } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function FacultyDashboard() {
  const { session } = useDemo();
  const navigate = useNavigate();
  const user = session!.user;
  const [insight, setInsight] = useState("");
  const [insightState, setInsightState] = useState<"loading" | "ready" | "unavailable">("loading");

  const subjects = useApi(() => api.get<Subject[]>("/subjects"), []);
  const classes = useApi(() => api.get<ClassSession[]>(`/classes?faculty=${user._id}`), [user._id]);
  const curriculum = useApi(() => api.get<Curriculum[]>("/curriculum"), []);
  const activities = useApi(() => api.get<Activity[]>(`/activities?createdBy=${user._id}`), [user._id]);
  const attendance = useApi(() => api.get<AttendanceSummary>("/attendance/summary"), []);
  const roster = useApi(() => api.get<User[]>("/users?role=student"), []);
  const studentStats = useApi(() => api.get<StudentAttendanceStat[]>("/attendance/students"), []);

  const mySubjects = (subjects.data ?? []).filter((subject) => {
    const facultyId = typeof subject.faculty === "object" ? subject.faculty._id : subject.faculty;
    return facultyId === user._id;
  });

  const today = todayLabel();
  const todaysClasses = (classes.data ?? []).filter((item) => item.schedule.days.includes(today));
  const mineCurriculum = (curriculum.data ?? []).filter((item) =>
    mySubjects.some((subject) => subject._id === item.subject._id)
  );
  const curriculumProgress = mineCurriculum.length
    ? Math.round(mineCurriculum.reduce((sum, item) => sum + item.progress, 0) / mineCurriculum.length)
    : 0;

  const focusSubject = mySubjects[0];
  const subjectAttendance = attendance.data?.bySubject.find(
    (item) => item.subject._id === focusSubject?._id
  );
  const subjectActivities = (activities.data ?? []).filter(
    (item) => item.subject._id === focusSubject?._id
  );
  const completion = subjectActivities.length
    ? Math.round(
        (subjectActivities.filter((item) => item.status === "completed" || item.status === "submitted")
          .length /
          subjectActivities.length) *
          100
      )
    : 0;

  useEffect(() => {
    if (!focusSubject || !attendance.data) return;
    void getFacultyInsight({
      subjectName: focusSubject.name,
      attendancePercent: subjectAttendance?.percent ?? attendance.data.overall,
      activityCompletion: completion,
      curriculumProgress,
    })
      .then((result) => {
        setInsight(result.text);
        setInsightState("ready");
      })
      .catch(() => setInsightState("unavailable"));
  }, [focusSubject, attendance.data, subjectAttendance, completion, curriculumProgress]);

  const loading =
    subjects.loading ||
    classes.loading ||
    curriculum.loading ||
    activities.loading ||
    attendance.loading ||
    roster.loading ||
    studentStats.loading;
  const error =
    subjects.error ||
    classes.error ||
    curriculum.error ||
    activities.error ||
    attendance.error ||
    roster.error ||
    studentStats.error;

  const pendingAttendance = todaysClasses.length ? 1 : 0;
  const studentCount = roster.data?.length ?? 0;
  const pendingActivities = (activities.data ?? []).filter(
    (item) => item.status === "pending" || item.status === "overdue"
  ).length;
  const attentionList = (studentStats.data ?? []).filter((item) => item.belowThreshold);
  const attentionPreview = attentionList.slice(0, 5);

  if (loading) return <LoadingState label="Loading faculty dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={subjects.reload} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">What needs attention today?</h1>
        <p className="mt-2 text-muted">{user.name}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={studentCount} hint="On your roster" />
        <StatCard
          label="Average Attendance"
          value={`${attendance.data?.overall ?? 0}%`}
          hint="Across all subjects"
        />
        <StatCard label="Curriculum Progress" value={`${curriculumProgress}%`} hint="Your subjects" />
        <StatCard label="Students Needing Attention" value={attentionList.length} hint="Below 75% attendance" />
        <StatCard label="Today's Classes" value={todaysClasses.length} />
        <StatCard label="Pending Attendance" value={pendingAttendance} hint="Mark today's session" />
        <StatCard label="Active Activities" value={activities.data?.length ?? 0} />
        <StatCard label="Pending Activities" value={pendingActivities} hint="Due or overdue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Today's Classes</h2>
            <Button variant="secondary" onClick={() => navigate("/faculty/subjects")}>
              Mark attendance
            </Button>
          </div>
          {todaysClasses.length ? (
            <ul className="space-y-4">
              {todaysClasses.map((item) => (
                <li key={item._id} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {item.schedule.time} · {item.subject.name}
                    </p>
                    <p className="text-sm text-muted">
                      {item.room} · {item.section}
                    </p>
                  </div>
                  <p className="text-sm text-muted">{studentCount} students</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No classes scheduled today"
              description="You can still update curriculum or review activities."
            />
          )}
        </Card>
        <AIInsightCard
          text={insight}
          loading={insightState === "loading"}
          unavailable={insightState === "unavailable"}
        />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium">Students needing attention</h2>
          <Button variant="secondary" onClick={() => navigate("/faculty/students")}>
            View all students
          </Button>
        </div>
        {attentionPreview.length ? (
          <ul className="space-y-3">
            {attentionPreview.map((item) => (
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
            title="Nobody needs attention right now"
            description="Every student is at or above 75% attendance."
          />
        )}
      </Card>
    </div>
  );
}
