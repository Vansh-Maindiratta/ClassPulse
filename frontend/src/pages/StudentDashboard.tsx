import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { getStudentInsight } from "../services/ai";
import { firstName, greetingForHour, todayLabel } from "../data/demoData";
import type { Activity, AttendanceSummary, ClassSession, Curriculum, AcademicRisk } from "../types";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { AttendanceCard } from "../components/attendance/AttendanceCard";
import { ActivityCard, formatDue } from "../components/activities/ActivityCard";
import { AIInsightCard } from "../components/ui/AIInsightCard";
import { ErrorState, LoadingState } from "../components/ui/States";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";

export function StudentDashboard() {
  const { session } = useDemo();
  const navigate = useNavigate();
  const user = session!.user;
  const [insight, setInsight] = useState("");
  const [insightState, setInsightState] = useState<"loading" | "ready" | "unavailable">("loading");

  const attendance = useApi(
    () => api.get<AttendanceSummary>(`/attendance/summary?student=${user._id}`),
    [user._id]
  );
  const activities = useApi(() => api.get<Activity[]>("/activities"), []);
  const classes = useApi(() => api.get<ClassSession[]>("/classes"), []);
  const curriculum = useApi(() => api.get<Curriculum[]>("/curriculum"), []);
  const risk = useApi(() => api.get<AcademicRisk>("/ai/risk"), [user._id]);

  const pending = useMemo(
    () =>
      (activities.data ?? [])
        .filter((item) => item.status === "pending" || item.status === "overdue")
        .slice(0, 4),
    [activities.data]
  );

  const today = todayLabel();
  const todaysClasses = (classes.data ?? []).filter((item) => item.schedule.days.includes(today));
  const overallCurriculum = curriculum.data?.length
    ? Math.round(
        curriculum.data.reduce((sum, item) => sum + item.progress, 0) / curriculum.data.length
      )
    : 0;

  useEffect(() => {
    const summary = attendance.data;
    if (!summary || !activities.data) return;

    const lowest = [...summary.bySubject].sort((a, b) => a.percent - b.percent)[0];
    const nearest = pending[0];

    void getStudentInsight({
      overallAttendance: summary.overall,
      pendingCount: pending.length,
      lowestSubject: lowest
        ? { name: lowest.subject.name, percent: lowest.percent }
        : null,
      pendingNear: nearest
        ? {
            type: nearest.type,
            subject: nearest.subject.name,
            dueLabel: formatDue(nearest.dueDate),
          }
        : null,
      curriculumProgress: overallCurriculum,
    })
      .then((result) => {
        setInsight(result.text);
        setInsightState("ready");
      })
      .catch(() => setInsightState("unavailable"));
  }, [attendance.data, activities.data, pending, overallCurriculum]);

  const loading = attendance.loading || activities.loading || classes.loading || curriculum.loading;
  const error = attendance.error || activities.error || classes.error || curriculum.error;

  if (loading) return <LoadingState label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={attendance.reload} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">
          {greetingForHour()}, {firstName(user.name)} 👋
        </h1>
        <p className="mt-2 text-muted">Here's what needs your attention today.</p>
      </header>

      <div className="grid gap-2 sm:grid-cols-3">
        <StatCard label="Overall Attendance" value={`${attendance.data?.overall ?? 0}%`} />
        <StatCard label="Overall Curriculum" value={`${overallCurriculum}%`} />
        <StatCard label="Pending Activities" value={pending.length} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Academic risk check</h2>
            <p className="mt-1 text-sm text-muted">{risk.data?.riskLevel === "INSUFFICIENT_DATA" ? "Not enough data yet" : `${risk.data?.riskLevel ?? "Loading"} · score ${risk.data?.riskScore ?? "—"}/100`}</p>
          </div>
          {risk.data?.reasons.length ? <p className="max-w-xl text-sm text-muted">{risk.data.reasons.join(" ")}</p> : null}
        </div>
        {risk.data?.recommendations.length ? <ul className="mt-3 list-inside list-disc text-sm text-muted">{risk.data.recommendations.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        <p className="mt-3 text-xs text-muted">Rule-based estimate from available data: {risk.data?.dataCoverage.join(", ") || "no indicators yet"}. This is guidance, not a diagnosis.</p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium">Attendance by subject</h2>
          <div className="space-y-2">
            {attendance.data?.bySubject.map((item) => (
              <AttendanceCard
                key={item.subject._id}
                name={item.subject.name}
                percent={item.percent}
                onClick={() => navigate("/student/attendance")}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Curriculum progress</h2>
          <div className="space-y-3">
            {curriculum.data?.map((item) => (
              <button
                key={item._id}
                className="w-full text-left"
              >
                <ProgressBar value={item.progress} label={item.subject.name} tone="info" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="mb-4 font-medium">Needs attention</h2>
          {pending.length ? (
            <div className="space-y-3">
              {pending.map((activity) => (
                <ActivityCard key={activity._id} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing pending"
              description="Your faculty hasn't added any activities that need attention right now."
            />
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-medium">Today's Classes</h2>
            {todaysClasses.length ? (
              <ul className="space-y-4">
                {todaysClasses.map((item) => (
                  <li key={item._id} className="flex gap-4">
                    <p className="w-24 shrink-0 text-sm font-medium">{item.schedule.time}</p>
                    <div>
                      <p className="text-sm font-medium">{item.subject.name}</p>
                      <p className="text-sm text-muted">Room {item.room}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No classes today"
                description="Enjoy the break, or catch up on pending activities."
              />
            )}
          </Card>
          <AIInsightCard
            text={insight}
            loading={insightState === "loading"}
            unavailable={insightState === "unavailable"}
          />
        </div>
      </div>
    </div>
  );
}
