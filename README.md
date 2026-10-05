# ClassPulse

ClassPulse is a full-stack student/class management platform (attendance, curriculum coverage, activities, and academic risk) for colleges. It is an open-source project for **Geekstober**, a beginner-friendly contribution event. The repo ships with realistic seeded demo data and intentionally contains a small number of minor, non-destructive issues for contributors to discover and fix.

## 1. Directory Structure

```text
ClassPulse/
├── frontend/                  # React + Vite + Tailwind client
│   ├── src/
│   │   ├── App.tsx            # route definitions, role guards, redirects
│   │   ├── main.tsx           # React entry point
│   │   ├── index.css          # Tailwind import + theme color tokens
│   │   ├── components/
│   │   │   ├── ui/            # Button, Card, Input, Badge, Modal, StatCard...
│   │   │   ├── auth/          # DemoAccounts helper (demo credential panel)
│   │   │   ├── activities/    # ActivityCard
│   │   │   ├── attendance/    # AttendanceCard
│   │   │   ├── curriculum/    # CurriculumProgress
│   │   │   └── dashboard/     # SubjectCard
│   │   ├── layouts/           # DashboardLayout (sidebar, mobile nav, sign out)
│   │   ├── pages/             # Landing, Login, Signup, Student/Teacher dashboards...
│   │   ├── hooks/             # useApi (fetch), useDemo (session context)
│   │   ├── services/          # api.ts (client + bearer token), ai.ts
│   │   ├── data/              # demoData helpers (greetings, weekday labels)
│   │   └── types/             # shared TypeScript models
│   ├── index.html
│   ├── .env.example           # VITE_API_URL placeholder only
│   ├── vite.config.ts         # dev server + /api proxy to localhost:5000
│   ├── vercel.json            # SPA rewrite (deployed frontend)
│   └── tsconfig*.json         # TypeScript configs
├── backend/                   # Node + Express + Mongoose API
│   ├── src/
│   │   ├── server.js          # Express app entry point
│   │   ├── config/            # db.js — MongoDB connection helper
│   │   ├── controllers/       # auth, users, subjects, classes, activities,
│   │   │                      #   attendance, curriculum, ai
│   │   ├── middleware/        # auth.js, validate.js, errorHandler.js
│   │   ├── models/            # User, Subject, Class, Activity, Attendance,
│   │   │                      #   Curriculum
│   │   ├── routes/            # Express routers mounted under /api
│   │   ├── services/          # authService (scrypt/JWT), aiService,
│   │   │                      #   riskAnalysisService
│   │   └── seed/              # seed.js — fictional demo dataset + --reset
│   ├── .env.example           # placeholders only (PORT, MONGODB_URI...)
│   └── package.json           # dev / start / seed / seed:reset
├── package.json               # root dev script (concurrently), seed scripts
├── LICENSE
└── .gitignore                 # ignores .env, node_modules/, dist/, logs
```

Purpose of the key directories:
- `frontend/src/pages/` — one file per screen; where screens and their handlers/navigation live.
- `frontend/src/components/` — shared UI pieces and Tailwind classes reused across screens.
- `frontend/src/App.tsx` — which screen appears at which URL, and who may see it (role guards).
- `frontend/src/index.css` — the ClassPulse color palette and base typography tokens.
- `backend/src/routes/` + `backend/src/controllers/` — what each endpoint does and how it validates/aggregates data.
- `backend/src/models/` — the shape and constraints of the data.
- `backend/src/middleware/` — authentication and server-side role authorization.
- `backend/src/seed/` — how the demo dataset is generated.

## 2. Project Objective

ClassPulse gives a college class a single, consistent place to track attendance, curriculum coverage, and activities — with a rule-based academic risk indicator that explains *why* a student may be falling behind instead of guessing.

Students see their attendance per subject, syllabus coverage, pending activities, and a plain-language risk check. Teachers mark attendance, create and track activities, keep curriculum topic status current, manage their student list, and review class analytics. Admins get a campus-level overview.

It is intended for students, faculty, and administrators of a college class, and its main purpose is to make it easy for everyone to answer one question: "how is this class actually going?"


### UI Issues
- Minor layout and alignment inconsistencies between screens
- Spacing and padding that drifts between shared components
- Responsive behavior that breaks (or clamps) at a specific viewport width
- Typography that deviates from the display/body font pairing
- Hover/focus states that do not match their sibling controls
- Icons chosen for an action that do not match it

### Functional Issues
- Buttons that look clickable but do nothing
- Navigation that lands on the wrong screen for a role
- State that does not update the way the UI suggests it should
- A "clear"/"reset" action that fails to perform its expected behavior

### Styling Issues
- Colors that drift from the ClassPulse palette
- Incorrect hover and status colors
- Visual inconsistencies in badges, borders, and progress indicators

> These issues are intentionally non-destructive: the app stays usable, login/signup/logout, MongoDB connectivity, and backend startup all keep working, no data is corrupted, and no secrets are exposed.

## 4. How to Solve the Problem

1. Run ClassPulse locally with seeded demo data.
2. Explore the application as each role — student, teacher, admin — using the demo accounts.
3. Identify unexpected behavior: resize the window, hover controls, click every button, compare sibling screens.
4. Reproduce the issue and note the exact steps and viewport width.
5. Locate the relevant file by searching the source for the visible text.
6. Inspect event handlers and props — is the handler present, and does it do what the label promises?
7. Inspect routes in `frontend/src/App.tsx` and confirm the target path exists for that role.
8. Inspect state handling — what does a click set, and what value is later compared against it?
9. Inspect CSS/Tailwind classes (tokens live in `frontend/src/index.css`).
10. For data issues, trace MongoDB → API response → hook → component and verify against the records.
11. Make the smallest appropriate fix — no refactors, no removed functionality.
12. Test the fix and confirm login, signup, logout, and navigation still work.
13. Submit a focused pull request describing symptom, cause, and before/after.

Do not look for solutions here — the cause is the contribution.

## 5. Where to Look

**Frontend (`frontend/src/`)**
- `pages/` — screen layout, handlers, navigation, and per-role content.
- `components/` — reusable UI, button/link behavior, and Tailwind classes.
- `App.tsx` — route definitions, guards, and redirects.
- `layouts/` — sidebar navigation and active link states.
- `hooks/` — `useApi` data loading and `useDemo` session context.
- `services/` — API client and endpoint paths (`api.ts`).
- `index.css` — color tokens and base typography.

**Backend (`backend/src/`)**
- `routes/` — endpoint paths and the middleware chain protecting them.
- `controllers/` — validation, aggregation, and responses per endpoint.
- `models/` — schema fields, defaults, and unique indexes.
- `middleware/` — authentication and `allowRoles` authorization.
- `services/` — scrypt/JWT helpers, AI text, and risk scoring.
- `seed/` — how the demo dataset is generated.
