import { Link, Navigate } from "react-router-dom";
import { GraduationCap, Presentation } from "lucide-react";
import { useDemo } from "../hooks/useDemo";
import { DemoAccounts } from "../components/auth/DemoAccounts";

const roles = [
  {
    to: "/login/student",
    icon: GraduationCap,
    title: "Student",
    description:
      "Follow your attendance, curriculum progress, pending activities, and academic risk check.",
    cta: "Student Login",
  },
  {
    to: "/login/teacher",
    icon: Presentation,
    title: "Teacher",
    description:
      "Manage classes, mark attendance, track curriculum, create activities, and review analytics.",
    cta: "Teacher Login",
  },
];

export function Landing() {
  const { session } = useDemo();
  if (session) return <Navigate to={`/${session.role}`} replace />;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-12">
      <header className="text-center">
        <h1 className="font-display text-5xl sm:text-6xl">ClassPulse</h1>
        <p className="mt-3 font-display text-xl text-primary">Stay on pulse.</p>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          ClassPulse keeps classes, attendance, curriculum, and activities in one place, so
          students know where they stand and teachers know who needs attention.
        </p>
      </header>

      <h2 className="mt-10 text-center text-sm font-medium tracking-wide uppercase text-muted">
        Choose your role
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.to}
              to={role.to}
              className="rounded-xl border border-line bg-surface p-6 text-left transition-colors hover:border-primary/40 hover:bg-background"
            >
              <span className="inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-2xl">{role.title}</h3>
              <p className="mt-1 text-sm text-muted">{role.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary">
                {role.cta} →
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        New to ClassPulse?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Create a student account
        </Link>
      </p>

      <div className="mx-auto mt-6 flex w-full max-w-md justify-center">
        <DemoAccounts />
      </div>
    </div>
  );
}
