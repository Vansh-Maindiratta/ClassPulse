import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role, User } from "../types";

const STORAGE_KEY = "classpulse-demo";

interface Session {
  role: Role;
  user: User;
  token: string;
}

interface DemoContextValue {
  session: Session | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const value = raw ? (JSON.parse(raw) as Session) : null;
    if (!value?.token || !value?.user?._id) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);

  useEffect(() => {
    if (!session?.token) return;
    const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
    fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          setSession(null);
          return;
        }
        if (!response.ok) return;
        const data = await response.json() as { user: User };
        const restored = { ...session, role: data.user.role, user: data.user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
        setSession(restored);
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({
      session,
      login: (user: User, token: string) => {
        const next = { role: user.role, user, token };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSession(next);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    }),
    [session]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
