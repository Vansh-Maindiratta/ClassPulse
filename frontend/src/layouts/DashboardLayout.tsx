import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useDemo } from "../hooks/useDemo";
import type { Role } from "../types";

const nav: Record<Role, { to: string; label: string }[]> = {
  student: [
    { to: "/student", label: "Dashboard" },
    { to: "/student/subjects", label: "Subjects" },
    { to: "/student/curriculum", label: "Curriculum" },
    { to: "/student/attendance", label: "Attendance" },
    { to: "/student/activities", label: "Activities" },
    { to: "/student/settings", label: "Settings" },
  ],
  faculty: [
    { to: "/faculty", label: "Dashboard" },
    { to: "/faculty/classes", label: "Classes" },
    { to: "/faculty/subjects", label: "My Subjects" },
    { to: "/faculty/students", label: "Students" },
    { to: "/faculty/attendance", label: "Attendance" },
    { to: "/faculty/curriculum", label: "Curriculum" },
    { to: "/faculty/activities", label: "Activities" },
    { to: "/faculty/analytics", label: "Analytics" },
    { to: "/faculty/settings", label: "Settings" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/faculty", label: "Faculty" },
    { to: "/admin/subjects", label: "Subjects" },
    { to: "/admin/classes", label: "Classes" },
    { to: "/admin/attendance", label: "Attendance" },
    { to: "/admin/curriculum", label: "Curriculum" },
    { to: "/admin/settings", label: "Settings" },
  ],
};

export function DashboardLayout() {
  const { session, logout } = useDemo();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = session?.role ?? "student";
  const links = nav[role];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <p className="font-display text-lg">ClassPulse</p>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="rounded-md p-2 hover:bg-background"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <aside
        className={`${
          open ? "block" : "hidden"
        } border-b border-line bg-surface p-4 lg:block lg:border-b-0 lg:border-r`}
      >
        <div className="mb-6 hidden lg:block">
          <p className="font-display text-2xl">ClassPulse</p>
          <p className="mt-1 text-sm text-muted">Stay on pulse.</p>
        </div>
        <p className="mb-3 inline-flex rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted">
          Demo Mode · {role}
        </p>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to.split("/").length === 2}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm ${
                  isActive ? "bg-secondary text-white" : "text-ink hover:bg-background"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="mt-8 text-sm text-muted hover:text-ink"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Switch role
        </button>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
