import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useDemo } from "../hooks/useDemo";
import { api } from "../services/api";
import type { User } from "../types";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  DemoAccounts,
  type DemoRole,
} from "../components/auth/DemoAccounts";

type Mode = "student" | "faculty";

const copy: Record<
  Mode,
  {
    title: string;
    description: string;
    submit: string;
    mismatch: string;
    otherTo: string;
    otherLabel: string;
  }
> = {
  student: {
    title: "Student Login",
    description: "Sign in to follow your classes, attendance, curriculum, and progress.",
    submit: "Sign in as student",
    mismatch: "This account has teacher access. Please use Teacher Login.",
    otherTo: "/login/teacher",
    otherLabel: "Login as Teacher",
  },
  faculty: {
    title: "Teacher Login",
    description: "Sign in to manage your classes, attendance, curriculum, and activities.",
    submit: "Sign in as teacher",
    mismatch: "This account is a student account. Please use Student Login.",
    otherTo: "/login/student",
    otherLabel: "Login as Student",
  },
};

function LoginForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { login, session } = useDemo();
  const cfg = copy[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (session) return <Navigate to={`/${session.role}`} replace />;

  function fillDemoAccount(role: DemoRole) {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.post<{ user: User; token: string }>("/auth/login", { email, password });
      const role = result.user.role;
      const allowed = mode === "student" ? role === "student" : role !== "student";
      if (!allowed) {
        setError(cfg.mismatch);
        return;
      }
      login(result.user, result.token);
      navigate(`/${role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12">
      <Link to="/" className="font-display text-4xl sm:text-5xl">ClassPulse</Link>
      <p className="mt-3 max-w-xl text-lg text-muted">{cfg.description}</p>
      <form onSubmit={signIn} className="mt-8 max-w-md space-y-4 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-2xl">{cfg.title}</h2>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>{loading ? "Signing in…" : cfg.submit}</Button>
      </form>

      <div className="mt-6 max-w-md">
        <DemoAccounts onUse={fillDemoAccount} />
      </div>

      <p className="mt-6 text-sm text-muted">
        {mode === "student" ? (
          <>
            New here?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Create student account</Link>
            {" · "}
          </>
        ) : null}
        <Link to={cfg.otherTo} className="font-medium text-primary hover:underline">{cfg.otherLabel}</Link>
        {" · "}
        <Link to="/" className="hover:text-ink">Back to home</Link>
      </p>
    </div>
  );
}

export function StudentLogin() {
  return <LoginForm mode="student" />;
}

export function TeacherLogin() {
  return <LoginForm mode="faculty" />;
}
