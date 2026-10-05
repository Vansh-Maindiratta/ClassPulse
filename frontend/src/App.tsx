import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DemoProvider, useDemo } from "./hooks/useDemo";
import { DashboardLayout } from "./layouts/DashboardLayout";
const Landing = lazy(() => import("./pages/Landing").then((m) => ({ default: m.Landing })));
const StudentLogin = lazy(() => import("./pages/Login").then((m) => ({ default: m.StudentLogin })));
const TeacherLogin = lazy(() => import("./pages/Login").then((m) => ({ default: m.TeacherLogin })));
const FacultyClasses = lazy(() => import("./pages/Classes").then((m) => ({ default: m.FacultyClasses })));
const FacultyAnalytics = lazy(() => import("./pages/Analytics").then((m) => ({ default: m.FacultyAnalytics })));
const Signup = lazy(() => import("./pages/Signup").then((m) => ({ default: m.Signup })));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard").then((m) => ({ default: m.StudentDashboard })));
const FacultyDashboard = lazy(() => import("./pages/FacultyDashboard").then((m) => ({ default: m.FacultyDashboard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const Attendance = lazy(() => import("./pages/Attendance").then((m) => ({ default: m.Attendance })));
const Activities = lazy(() => import("./pages/Activities").then((m) => ({ default: m.Activities })));
const CurriculumPage = lazy(() => import("./pages/Curriculum").then((m) => ({ default: m.CurriculumPage })));
const Settings = lazy(() => import("./pages/Settings").then((m) => ({ default: m.Settings })));
const Subjects = lazy(() => import("./pages/Subjects").then((m) => ({ default: m.Subjects })));
const People = lazy(() => import("./pages/People").then((m) => ({ default: m.People })));
const AdminClasses = lazy(() => import("./pages/People").then((m) => ({ default: m.AdminClasses })));
const AdminSubjects = lazy(() => import("./pages/People").then((m) => ({ default: m.AdminSubjects })));
import type { Role } from "./types";

function Guard({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useDemo();
  if (!session) return <Navigate to="/" replace />;
  if (session.role !== role) return <Navigate to={`/${session.role}`} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading ClassPulse…</div>}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/teacher" element={<TeacherLogin />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/student"
        element={
          <Guard role="student">
            <DashboardLayout />
          </Guard>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="activities" element={<Activities />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route
        path="/faculty"
        element={
          <Guard role="faculty">
            <DashboardLayout />
          </Guard>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="classes" element={<FacultyClasses />} />
        <Route path="analytics" element={<FacultyAnalytics />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="activities" element={<Activities />} />
        <Route path="students" element={<People role="student" title="Students" />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route
        path="/admin"
        element={
          <Guard role="admin">
            <DashboardLayout />
          </Guard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<People role="student" title="Students" />} />
        <Route path="faculty" element={<People role="faculty" title="Faculty" />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <AppRoutes />
    </DemoProvider>
  );
}
