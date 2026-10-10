# ClassPulse

ClassPulse is a full-stack college class management application for tracking subjects, attendance, curriculum coverage, activities, and a rule-based academic risk estimate. It provides separate Student, Faculty, and Admin workflows. The repository is also used for Geekstober contributions and contains eight deliberately seeded, non-security defects; see [CONTRIBUTING.md](CONTRIBUTING.md) for exact reproduction steps.

The frontend and API are implemented, but deployment and production readiness have not been verified. Do not use real student data for local development.

## Features in the repository

- **Authentication:** student registration, login, persisted bearer-token sessions, and role-aware frontend routes. The server validates tokens and rechecks active user records for protected endpoints.
- **Student:** attendance summaries and history, subjects, curriculum progress, activities, classes today, and a rule-based risk summary.
- **Faculty:** class list, attendance marking, student attendance summaries, curriculum topic status updates, activity creation/editing, and analytics.
- **Admin:** campus overview, people lists, subjects, classes, curriculum, and attendance overview. The admin screens are mostly read-only.
- **Shared workflows:** responsive navigation, loading/error/empty states, activity description summaries with deterministic fallback, and seeded fictional demo data.

These features have not all been tested end-to-end. In particular, there is no automated test or lint script in the current package manifests.

## Technology

| Area | Verified technologies |
| --- | --- |
| Frontend | React 19, TypeScript 5.7, Vite 6, React Router 7, Tailwind CSS 4, Recharts |
| Backend | Node.js ES modules, Express 4, Mongoose 8 |
| Authentication | scrypt password hashing and HMAC-SHA256 signed bearer tokens, implemented in `backend/src/services/authService.js` |
| Database | MongoDB through Mongoose |
| Hosting configuration | Vercel SPA rewrite in `frontend/vercel.json`; backend reads Render's `PORT` |

Exact resolved versions are recorded in the frontend and backend lockfiles. The project has no `engines` field; use a supported current Node.js LTS release. The checked local environment used Node 24 and npm 11.

## Repository layout

```text
ClassPulse/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── controllers/  # Request handling and data aggregation
│   │   ├── middleware/   # Authentication, role checks, validation, errors
│   │   ├── models/       # User, Subject, Class, Activity, Attendance, Curriculum
│   │   ├── routes/       # Express API route definitions
│   │   ├── seed/         # Fictional development dataset
│   │   └── services/     # Auth, AI summaries, academic risk calculation
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared UI, activity, attendance, curriculum, dashboard
│   │   ├── data/         # Small display helpers
│   │   ├── hooks/        # Session and API hooks
│   │   ├── layouts/      # Role-specific dashboard navigation
│   │   ├── pages/        # Screens and page-level workflows
│   │   ├── services/     # API and AI client functions
│   │   └── types/        # Shared TypeScript interfaces
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── CONTRIBUTING.md
├── LICENSE
└── package.json           # Root development and seed commands
```

There is no checked-in automated test directory or test script. Tests and builds should be added as contribution work where appropriate.

## Prerequisites

- Node.js and npm. No exact minimum is declared in the project; Node.js LTS is recommended.
- A MongoDB Atlas cluster or local MongoDB database accessible to the backend. Use a separate empty development database and your own database user. Do not reuse production credentials or real student records.
- Optional AI provider credentials only if you want provider-backed summaries. The app falls back to deterministic text without an AI key.

## Local setup

Fork [Vansh-Maindiratta/ClassPulse](https://github.com/Vansh-Maindiratta/ClassPulse), then run:

```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/ClassPulse.git
cd ClassPulse
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

Create the local environment files from the checked-in safe templates:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

On Windows PowerShell, use `Copy-Item backend/.env.example backend/.env` and `Copy-Item frontend/.env.example frontend/.env.local`.

Edit `backend/.env`: set `MONGODB_URI` to your development database and set `JWT_SECRET` to a random string of at least 32 characters. Keep the default local `CLIENT_URL` for local use. Vite proxies `/api` to `http://localhost:5000` unless `VITE_DEV_API_URL` is set; leave `VITE_API_URL` empty locally.

For an empty development database, optionally create the fictional dataset:

```sh
npm run seed
```

Seed sign-in accounts are `student.demo@classpulse.local` and `teacher.demo@classpulse.local`; the default password is `DemoPass123!`, unless you set `DEMO_PASSWORD` before seeding. The seed command refuses to run if it finds existing users. **Do not run `npm run seed:reset` against any database with data you need:** it deletes the ClassPulse collections before reseeding.

Start both applications from the repository root:

```sh
npm run dev
```

The Vite frontend is configured for port `5173`; the Express API defaults to port `5000`. You can also start them separately with `npm run dev --prefix backend` and `npm run dev --prefix frontend` in separate terminals. Visit <http://localhost:5173>. Check API connectivity at <http://localhost:5000/api/health>.

## Environment variables

Copy the relevant `.env.example` file before configuring local values. Use placeholders only in shared examples; do not commit `.env` or `.env.local` files.

| Variable | Application | Purpose | Required? | Safe example |
| --- | --- | --- | --- | --- |
| `MONGODB_URI` | Backend | MongoDB connection string | Yes | `mongodb+srv://<user>:<password>@<cluster>/<database>` |
| `JWT_SECRET` | Backend | Signs session tokens; token operations require at least 32 characters | Yes | `replace-with-a-random-secret-of-32-or-more-characters` |
| `PORT` | Backend | HTTP port; defaults to 5000 and honors hosting platform port | No | `5000` |
| `NODE_ENV` | Backend | Runtime mode; production additionally enforces JWT secret length at startup | No | `development` |
| `CLIENT_URL` | Backend | Allowed CORS origin(s), comma-separated; defaults to local Vite origin | No | `http://localhost:5173` |
| `DEMO_PASSWORD` | Backend seed | Password to assign to all seed demo accounts | No | `set-a-local-demo-password` |
| `AI_API_KEY` | Backend | Optional bearer key for the configured AI-compatible provider | No | `replace-with-your-own-key` |
| `AI_API_URL` | Backend | Optional chat-completions endpoint; defaults to OpenAI-compatible URL in code | No | `https://api.example.test/v1/chat/completions` |
| `AI_MODEL` | Backend | Optional provider model name; defaults to `gpt-4o-mini` | No | `your-model-name` |
| `VITE_API_URL` | Frontend | API base URL; defaults to same-origin `/api` | No locally; set for deployment | `https://<your-backend-host>/api` |
| `VITE_DEV_API_URL` | Frontend dev server | Overrides the local Vite `/api` proxy target | No | `http://localhost:5000` |

Only `MONGODB_URI` and `JWT_SECRET` are in `backend/.env.example`; the optional AI variables above are read by the source but are not required. `VITE_API_URL` is in `frontend/.env.example`; `VITE_DEV_API_URL` is read by Vite configuration but is not listed in that template.

## Database

The Mongoose models define the `User`, `Subject`, `Class`, `Activity`, `Attendance`, and `Curriculum` collections (MongoDB uses their model-derived collection names). Create a database and database user in Atlas, allow the development machine's network address, and put the URI in `backend/.env`. Keep the database limited to fictional seed data or data you are permitted to use. The app connects before the API begins listening; a successful server log reports MongoDB connection and the listening port. `/api/health` indicates that the HTTP API is responding, not by itself that a separately started database is healthy.

## API overview

All routes below are prefixed with `/api`. `GET /health`, `POST /auth/login`, and `POST /auth/register` are public. `GET /auth/me` requires a bearer token. All other route groups require a valid bearer token; role restrictions are listed explicitly. Errors are JSON objects with a `message` field in the current backend.

| Method and path | Access | Purpose and inputs |
| --- | --- | --- |
| `GET /health` | Public | API liveness; `{ "success": true, "message": "API is running" }` |
| `POST /auth/login` | Public | Body `{ "email": "student@example.test", "password": "…" }`; returns `{ token, user }`; invalid credentials return 401. |
| `POST /auth/register` | Public | Student-only self-registration; body `{ "name", "email", "password" }`; password must be at least 10 chars; returns 201 `{ token, user }`. |
| `GET /auth/me` | Bearer | Returns the current public user; invalid/expired token returns 401. |
| `GET /users?role=student\|faculty` | Faculty, Admin | List users; optional `role` filter. `GET /users/:id` returns one user. |
| `GET /subjects` and `GET /subjects/:id` | Student, Faculty, Admin | List subjects or fetch a subject; missing ID returns 404. |
| `GET /classes?faculty=:id&subject=:id` | Bearer | List classes; both filters are optional. |
| `GET /activities?subject=:id&createdBy=:id` | Bearer | List activities; filters are optional; overdue status is derived from due date. |
| `POST /activities` | Faculty, Admin | Body `{ title, subject, type, dueDate, createdBy, description? }`; creates a pending activity. Missing required fields return 400. |
| `PUT /activities/:id` | Faculty, Admin | Updates supported fields: `title`, `description`, `subject`, `type`, `dueDate`, `status`; missing record returns 404. |
| `GET /attendance?student=:id&subject=:id` | Bearer | List attendance; student callers are restricted to their own records. |
| `GET /attendance/summary?student=:id&subject=:id` | Bearer | Aggregate attendance and per-subject forecast; student callers are restricted to their own records. |
| `GET /attendance/students?threshold=75` | Faculty, Admin | Per-student attendance statistics and threshold flag. |
| `GET /attendance/roster` | Faculty, Admin | List student accounts used by attendance marking. |
| `POST /attendance` | Faculty, Admin | Body `{ "records": [{ "student": "<id>", "subject": "<id>", "date": "2026-10-10", "status": "present" }] }`; upserts by student, subject, and date. Invalid records return 400. |
| `GET /curriculum?subject=:id` | Bearer | List curriculum, optionally for one subject; includes derived progress. |
| `PUT /curriculum/:id` | Faculty, Admin | Body `{ "units": [...] }`; replaces units and returns updated curriculum. |
| `GET /ai/risk?student=:id` | Student, Faculty, Admin | Rule-based risk estimate; student callers are always evaluated against their own account. |
| `POST /ai/insight` | Bearer | Body contains role-specific summary data; returns generated or fallback `{ text, source }`. |
| `POST /ai/summarize` | Bearer | Body `{ "text": "…" }`; returns `{ text, source }`; empty text returns 400. |

The API does not currently expose create/update endpoints for classes or subjects. See route and controller source for complete response fields. Do not treat sample IDs above as real values.

## Deployment configuration

The repository includes a Vercel SPA rewrite and backend support for a platform-provided `PORT`, but deployment has not been performed or verified.

**Frontend on Vercel**

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed backend origin ending in `/api`.

**Backend on Render**

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Configure `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_URL` with the deployed frontend origin. The server uses Render's `PORT` when provided.

Before deploying the frontend, verify the backend starts with its database configuration and that `/api/health` responds. The current health route is a liveness response and does not independently report database status. Verify CORS and authenticated API calls against the deployed origins; no live deployment is claimed here.

## Intentional Geekstober issues

Eight deliberately introduced exercises cover dashboard data, search, class display, form validation, attendance UI state, API error feedback, and activity refresh behavior. They are bounded functional defects; authentication, authorization, password handling, and database write permissions were not deliberately weakened. See [CONTRIBUTING.md](CONTRIBUTING.md) for each issue's difficulty, reproduction, expected/actual behavior, and acceptance criteria.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), choose an available issue, reproduce it locally, and open a focused pull request with the issue ID and checks performed. GitHub issues have not been created or assigned by this repository audit.

## Troubleshooting

- **Mongo connection fails:** confirm the URI, database user/password encoding, Atlas network access, and that this is a development database. Do not paste the full URI into an issue.
- **API does not start:** the server connects to MongoDB before listening. Check `MONGODB_URI` and `JWT_SECRET`; production requires the secret length to be at least 32 characters.
- **Frontend cannot reach API:** locally, verify backend port 5000 and the Vite `/api` proxy. For deployments, set `VITE_API_URL` to the backend URL plus `/api`.
- **CORS errors:** set backend `CLIENT_URL` to the exact frontend origin; multiple origins are comma-separated.
- **Port conflict:** choose a free backend `PORT`; Vite is configured for 5173 and may need its own CLI port override if occupied.
- **Missing dependency:** install root, backend, and frontend lockfile dependencies with the three `npm ci` commands above.
- **Vercel build fails:** confirm Vercel root `frontend`, build `npm run build`, output `dist`, and all required frontend environment variables.
- **Render startup fails:** confirm root `backend`, build `npm ci`, start `npm start`, valid MongoDB connectivity, and platform-provided `PORT` configuration.

## License

The repository includes an [MIT License](LICENSE).
