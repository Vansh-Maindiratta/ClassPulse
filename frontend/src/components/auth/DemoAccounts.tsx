import { useState } from "react";
import { Button } from "../ui/Button";

export type DemoRole = "student" | "teacher";

/**
 * Fictional demo accounts created by `npm run seed`.
 * Local development only — these never exist in production.
 */
export const DEMO_ACCOUNTS: Record<DemoRole, { label: string; email: string }> = {
  student: {
    label: "Demo Student Account",
    email: "student.demo@classpulse.local",
  },
  teacher: {
    label: "Demo Teacher Account",
    email: "teacher.demo@classpulse.local",
  },
};

/** Default demo password used by the seed script (override with DEMO_PASSWORD before seeding). */
export const DEMO_PASSWORD = "DemoPass123!";

interface Props {
  /** When provided, each account gets a "Use demo account" button that fills the login form. */
  onUse?: (role: DemoRole) => void;
}

export function DemoAccounts({ onUse }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-primary hover:underline"
      >
        Show demo credentials
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-4">
      <p className="text-xs font-semibold tracking-wide uppercase">Demo credentials — local development only</p>
      <ul className="mt-3 space-y-3">
        {(Object.keys(DEMO_ACCOUNTS) as DemoRole[]).map((role) => (
          <li key={role} className="rounded-lg bg-background p-3">
            <p className="text-xs font-medium text-muted">{DEMO_ACCOUNTS[role].label}</p>
            <p className="mt-1 break-all text-sm">{DEMO_ACCOUNTS[role].email}</p>
            <p className="text-sm text-muted">
              Password: <span className="font-medium text-ink">{DEMO_PASSWORD}</span>
            </p>
            {onUse ? (
              <button
                type="button"
                onClick={() => onUse(role)}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Use demo account
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        These accounts are seeded for local development. They are not real credentials and never exist in production.
      </p>
      <div className="mt-3">
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Hide credentials
        </Button>
      </div>
    </div>
  );
}
