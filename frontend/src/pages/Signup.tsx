import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import { useDemo } from "../hooks/useDemo";
import { api } from "../services/api";
import type { User } from "../types";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";

export function Signup() {
  const navigate = useNavigate();
  const { session } = useDemo();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (!created) return;
    const timer = setTimeout(() => navigate("/login/student"), 2000);
    return () => clearTimeout(timer);
  }, [created, navigate]);

  if (session) return <Navigate to={`/${session.role}`} replace />;

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post<{ user: User; token: string }>("/auth/register", { name, email, password });
      setCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12">
        <h1 className="font-display text-4xl sm:text-5xl">ClassPulse</h1>
        <div className="mt-8 max-w-md rounded-xl border border-line bg-surface p-6">
          <h2 className="font-display text-2xl">Account created</h2>
          <p className="mt-2 text-sm text-muted">
            Your ClassPulse account is ready. Taking you to the sign-in page…
          </p>
          <div className="mt-4">
            <Button onClick={() => navigate("/login/student")}>Continue to sign in</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12">
      <h1 className="font-display text-4xl sm:text-5xl">ClassPulse</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">
        Create an account to follow your classes, attendance, and progress.
      </p>
      <form onSubmit={signUp} className="mt-8 max-w-md space-y-4 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-2xl">Create your account</h2>
        <Field label="Name" htmlFor="name">
          <Input id="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Email" htmlFor="signup-email">
          <Input id="signup-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Password" htmlFor="signup-password">
          <Input id="signup-password" type="password" autoComplete="new-password" required minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword">
          <Input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </Field>
        <p className="text-xs text-muted">Use at least 10 characters for your password.</p>
        {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login/student" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
