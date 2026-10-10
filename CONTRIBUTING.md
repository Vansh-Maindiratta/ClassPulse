# Contributing to ClassPulse

Thanks for helping improve ClassPulse during Geekstober. The app supports student, faculty, and admin workflows for subjects, classes, attendance, curriculum, and activities. This repository includes eight deliberately seeded contribution defects so contributors can practice reproducing a behavior, tracing it through the frontend/API, and fixing it with focused regression coverage.

Fixes should preserve the existing UX and API where practical, keep authentication and role checks intact, and protect database integrity. Never use real student records or credentials.

## Set up a local copy

1. Fork [Vansh-Maindiratta/ClassPulse](https://github.com/Vansh-Maindiratta/ClassPulse) on GitHub.
2. Clone your fork and add the source remote:

   ```sh
   git clone https://github.com/YOUR_GITHUB_USERNAME/ClassPulse.git
   cd ClassPulse
   git remote add upstream https://github.com/Vansh-Maindiratta/ClassPulse.git
   ```

3. Install the lockfile-pinned dependencies:

   ```sh
   npm ci
   npm ci --prefix backend
   npm ci --prefix frontend
   ```

4. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local`. In the backend file, set `MONGODB_URI` to your own empty development database and set `JWT_SECRET` to a random string of at least 32 characters. Do not commit either local env file. Optional provider-backed AI summaries use `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL`; deterministic fallback text is available without them.
5. If you want the fictional demo data, run `npm run seed` against the empty development database. It refuses to seed when users already exist. The `npm run seed:reset` command deletes ClassPulse data before reseeding; never run it against data you need.
6. Start the backend and frontend together with `npm run dev`, or separately with `npm run dev --prefix backend` and `npm run dev --prefix frontend`. The defaults are API port 5000 and Vite port 5173. Verify API liveness at `http://localhost:5000/api/health`.

Demo student and faculty emails are `student.demo@classpulse.local` and `teacher.demo@classpulse.local`. Their password is `DemoPass123!`, unless `DEMO_PASSWORD` was set when seeding. Seeded demo credentials are for local development only.

### Available checks

The repository currently has no test, lint, or backend build script. The checked frontend command is:

```sh
npm run build --prefix frontend
```

It runs TypeScript project builds and the Vite production build. There are no automated backend tests. For backend changes, exercise the affected endpoint against a separate development database and preserve its authorization checks. Do not report tests as passing if they were not run.

## Intentional issue catalogue

These are source-level defects intentionally added for this contribution exercise. The checked-in app has no automated test framework. In this audit environment, the frontend built, but local API requests were blocked and MongoDB connectivity could not be confirmed. The actual behaviors below are verified from the changed code paths; contributors should confirm them at runtime with the fictional seed dataset and a working local API before implementing a fix.

### CP-01 — Student total counts faculty accounts

**Difficulty:** Good first issue  
**Category:** Admin dashboard data accuracy  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** The Students statistic on the Admin Dashboard counts faculty accounts. The faculty statistic still counts faculty, so both cards display the same faculty total instead of separating students and faculty.

**Affected files:** `frontend/src/pages/AdminDashboard.tsx`

**Prerequisites:** A signed-in Admin account and a seeded database with student and faculty users.

**Steps to reproduce:**
1. Start the local API and frontend with the demo database.
2. Sign in through Teacher Login using the seeded admin email `admin@classpulse.edu` and the configured demo password.
3. Open the Admin Dashboard.
4. Compare Students and Faculty cards with the seeded user totals.

**Example input:** Seeded dataset: 12 students and 3 faculty (plus one admin).

**Expected behavior:** Students shows 12 and Faculty shows 3.  
**Actual behavior:** Both cards show 3.

**Acceptance criteria:**
- [ ] The Students statistic counts only student accounts.
- [ ] Faculty remains an independent count.
- [ ] A regression test covers a dataset with different student and faculty totals.
- [ ] Relevant project checks pass.

**Suggested regression test:** Extract or test the role-filtering calculation with two student users, one faculty user, and one admin; assert the two counts are 2 and 1.

**Scope boundaries:** Keep the change to dashboard calculation and focused coverage; do not redesign the dashboard or change user APIs.  
**Security note:** User listing remains protected by the existing faculty/admin role middleware.

### CP-02 — People search is case-sensitive

**Difficulty:** Good first issue  
**Category:** Search and filtering  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** People search compares the entered text directly against names and emails. Searching with a different letter case does not match the same account.

**Affected files:** `frontend/src/pages/People.tsx`

**Prerequisites:** Signed in as Admin, or as Faculty for the student list; seeded users are sufficient.

**Steps to reproduce:**
1. Open Admin → Students.
2. Search for `AARAV` when the list contains `Aarav Sharma` and `aarav.sharma@college.edu`.
3. Observe no result; replace the query with `Aarav` and observe the match.

**Example input:** `AARAV` against `Aarav Sharma` / `aarav.sharma@college.edu`.

**Expected behavior:** Name and email searches ignore letter case.  
**Actual behavior:** The uppercase search does not match the name or email prefix.

**Acceptance criteria:**
- [ ] Search matches regardless of letter case.
- [ ] Name and email matching both work.
- [ ] Empty input still shows the full list.
- [ ] Regression coverage includes mixed-case query and record text.

**Suggested regression test:** Test a shared filtering helper with query `AARAV` and a record whose name is `Aarav Sharma`.

**Scope boundaries:** Keep the API query and role filter unchanged.  
**Security note:** Do not expose users beyond the backend's existing faculty/admin permissions.

### CP-03 — Subject cards repeat the room instead of showing time

**Difficulty:** Good first issue  
**Category:** Student/class data display  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** When a class exists for a subject, its subject card displays the room twice. The scheduled time is omitted.

**Affected files:** `frontend/src/pages/Subjects.tsx`

**Prerequisites:** Sign in and open Subjects; the seeded database includes subject/class records.

**Steps to reproduce:**
1. Sign in as Student, Faculty, or Admin.
2. Open the Subjects screen (for Faculty, open My Subjects).
3. Find a seeded subject with an assigned class.
4. Compare the metadata line with the class schedule.

**Example input:** A class with section `A`, room `Room 201`, and time `09:00`.

**Expected behavior:** The card shows section, room, and scheduled time once each.  
**Actual behavior:** It shows `A · Room 201 · Room 201`.

**Acceptance criteria:**
- [ ] The class card includes the schedule time.
- [ ] Section and room remain visible.
- [ ] Regression coverage checks all three displayed values.

**Suggested regression test:** Render a SubjectCard using a class with distinct section, room, and time values; assert each appears exactly once.

**Scope boundaries:** Do not add a new class management workflow or change the API.  
**Security note:** Preserve existing signed-in access and avoid exposing unrelated class data.

### CP-04 — A valid one-character activity title is rejected

**Difficulty:** Intermediate  
**Category:** Form validation and feedback  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** The activity form rejects a non-whitespace title with one character, even though the backend model accepts it as a required title. This is a frontend/backend validation mismatch.

**Affected files:** `frontend/src/pages/Activities.tsx`; backend acceptance behavior is defined in `backend/src/controllers/activityController.js` and `backend/src/models/Activity.js`.

**Prerequisites:** Sign in as Faculty and have at least one subject available for activity creation.

**Steps to reproduce:**
1. Open Faculty → Activities and select Create Activity.
2. Enter title `A`, choose a subject and type, and choose a valid due date.
3. Submit the form.

**Example input:** Title `A`, type `assignment`, a valid subject ID, and a future date.

**Expected behavior:** Any non-whitespace title accepted by the backend can be submitted.  
**Actual behavior:** The client displays “Title must contain at least 2 characters.” and makes no request.

**Acceptance criteria:**
- [ ] Client validation agrees with the existing server/model rule.
- [ ] Empty titles still receive clear feedback.
- [ ] Regression coverage includes one-character and empty titles.
- [ ] Server validation remains intact.

**Suggested regression test:** Verify `A` passes client validation and an empty string does not; retain a backend test for the required field.

**Scope boundaries:** Do not weaken server-side checks or change activity ownership rules.  
**Security note:** Keep activity create/update routes restricted to Faculty and Admin.

### CP-05 — Mark All Present updates only the first student

**Difficulty:** Good first issue  
**Category:** Attendance workflow  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** The Mark All Present action updates only the first roster entry. Attendance records are not written until Save attendance, so the issue is bounded to the current form state.

**Affected files:** `frontend/src/pages/Attendance.tsx`

**Prerequisites:** Sign in as Faculty, with at least two students in the roster and a class available.

**Steps to reproduce:**
1. Open Faculty → Attendance.
2. Set every roster row to Absent using its status selector.
3. Click Mark All Present.
4. Observe the status selectors.

**Example input:** Two or more roster students, each initially selected as Absent.

**Expected behavior:** Every roster row changes to Present.  
**Actual behavior:** Only the first row changes to Present; remaining rows stay Absent.

**Acceptance criteria:**
- [ ] Mark All Present updates every roster row.
- [ ] Individual status edits still work.
- [ ] Regression coverage verifies at least two students.
- [ ] No API write occurs until Save attendance is selected.

**Suggested regression test:** Render the attendance form with two students, set both to absent, click Mark All Present, and assert both controls show present.

**Scope boundaries:** Keep the existing date, class, and persistence behavior unchanged.  
**Security note:** Attendance writes must remain protected by existing Faculty/Admin authorization.

### CP-06 — Attendance save remains in loading state after failure

**Difficulty:** Good first issue  
**Category:** Loading and UI state  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** If the attendance save request fails, the error message appears but the button remains disabled and says “Saving attendance” indefinitely.

**Affected files:** `frontend/src/pages/Attendance.tsx`

**Prerequisites:** Signed-in Faculty with a loaded attendance form. Use a local development session only.

**Steps to reproduce:**
1. Load Faculty → Attendance while the API is available.
2. Temporarily stop the local API or disconnect the local network.
3. Change a status and click Save attendance.
4. Observe the displayed error and button state.

**Example input:** Any roster row changed to Absent while the API is unavailable at save time.

**Expected behavior:** After the handled failure, the error is shown and the button becomes enabled again.  
**Actual behavior:** The button stays disabled and displays “Saving attendance”.

**Acceptance criteria:**
- [ ] Saving state resets after success and failure.
- [ ] Failure feedback remains visible.
- [ ] Regression coverage includes a rejected save request.

**Suggested regression test:** Mock the attendance POST to reject and assert the save button exits its loading/disabled state.

**Scope boundaries:** Do not retry or submit attendance automatically.  
**Security note:** Do not leave attendance data exposed or bypass the protected POST route.

### CP-07 — API validation messages are replaced by generic feedback

**Difficulty:** Intermediate  
**Category:** API error handling  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** The backend returns errors in a JSON `message` property, but the shared frontend API client looks for `error`. Most backend validation and not-found details are therefore replaced with generic academic-data feedback.

**Affected files:** `frontend/src/services/api.ts`; response contract is defined by `backend/src/middleware/errorHandler.js` and route/controller validation.

**Prerequisites:** Any signed-in role and a request that produces a backend 4xx response.

**Steps to reproduce:**
1. Sign in to the Vite app and open the browser developer console.
2. Run `const { api } = await import("/src/services/api.ts"); await api.get("/subjects/not-a-mongodb-id");`.
3. Observe the rejected error text and compare it with the backend response body for the same request.

**Example input:** `GET /api/subjects/not-a-mongodb-id` with a valid token. The backend's CastError handler returns a 400 message.

**Expected behavior:** The user receives the safe, specific message returned by the backend.  
**Actual behavior:** The client shows “Unable to load academic data. Please try again later.”

**Acceptance criteria:**
- [ ] The API client reads the backend's documented `message` field.
- [ ] Empty or malformed error bodies still receive a safe fallback.
- [ ] Regression coverage checks a response containing `{ "message": "Please check the submitted academic data." }`.
- [ ] No token, stack trace, or secret is exposed.

**Suggested regression test:** Mock a 400 JSON response with a `message` field and assert that the thrown error preserves that safe message.

**Scope boundaries:** Keep the backend error shape and authentication behavior unchanged.  
**Security note:** Never surface stack traces, credentials, token values, or raw database errors.

### CP-08 — Editing an activity closes the form without refreshing the list

**Difficulty:** Intermediate  
**Category:** Faculty activity management  
**Status:** Intentionally introduced — awaiting contributor fix

**Description:** A successful activity edit closes the dialog but skips reloading the list. The backend record is updated, while the card continues showing the old values until the page is reloaded.

**Affected files:** `frontend/src/pages/Activities.tsx`

**Prerequisites:** Sign in as Faculty; create or use an activity that appears in the faculty activity list.

**Steps to reproduce:**
1. Open Faculty → Activities and choose an existing activity.
2. Change its title or due date and save.
3. Observe the card after the dialog closes, then reload the page.

**Example input:** Change an activity title from `Lab 1` to `Lab 1 revised`.

**Expected behavior:** The updated title or due date appears in the list immediately after a successful save.  
**Actual behavior:** The card shows the old value until the page is reloaded.

**Acceptance criteria:**
- [ ] Successful edits refresh or update the displayed activity.
- [ ] Successful creation continues to add the new activity to the list.
- [ ] Failed requests keep the form open and show an error.
- [ ] Regression coverage checks edit and create paths independently.

**Suggested regression test:** Mock a successful update response and assert the activity list reflects the returned values without remounting the page.

**Scope boundaries:** Keep the existing endpoint, allowed fields, and activity status rules.  
**Security note:** Preserve the existing Faculty/Admin route permission and do not alter `createdBy` ownership data.

## Selecting and claiming an issue

1. Read the catalogue and choose one issue that is still available.
2. Search the [GitHub Issues](https://github.com/Vansh-Maindiratta/ClassPulse/issues) and pull requests for duplicates. The catalogue IDs are local contribution references; this audit has not created, assigned, or labelled GitHub issues.
3. Follow any current Geekstober or repository maintainer claiming process shown on GitHub. If claiming or approval is required, wait for the maintainer before starting a competing implementation.
4. Keep the pull request focused on one issue. Mention its CP ID and link the GitHub issue if one exists.

## Branch names

Use a short, descriptive branch name, for example:

- `fix/cp-01-dashboard-count`
- `fix/cp-02-search-case`
- `fix/cp-04-activity-title-validation`
- `fix/cp-07-api-error-message`
- `docs/classpulse-contributing`

## Coding guidelines

- Follow the existing React, TypeScript, Express, and formatting conventions.
- Prefer the smallest clear change and reuse existing components and utilities.
- Avoid unrelated UI redesigns and unnecessary dependencies.
- Preserve API contracts unless the selected issue explicitly requires a documented correction.
- Keep loading, success, empty, and error states accurate.
- Keep client validation aligned with server validation.
- Preserve Student, Faculty, and Admin route behavior and server-side authorization.
- Never commit credentials, `.env` files, tokens, or production student data.
- Avoid unnecessary schema changes and never disable authorization to make a test pass.

## Testing guidance

Reproduce the selected bug before changing it. Trace the behavior across the page, shared API service, route, controller, and model as needed. Add focused regression coverage where practical; there is no existing test runner configured, so a new test setup should be scoped and explained. Run the frontend build with `npm run build --prefix frontend`. The backend currently provides `dev`, `start`, `seed`, and `seed:reset` scripts but no test or lint command. For backend changes, exercise the affected API with a local development database and permitted demo accounts. Never test against production student data.

## Commit messages

Use Conventional Commit style and include the issue ID in the pull request description:

- `fix(dashboard): correct student count`
- `fix(search): handle mixed-case queries`
- `fix(forms): accept one-character titles`
- `fix(api): preserve validation messages`
- `test(attendance): cover mark-all behavior`
- `docs: improve classpulse setup guide`

## Pull request checklist

- [ ] State the CP issue ID and link the GitHub issue if one exists.
- [ ] Describe the bug, root cause, and fix.
- [ ] List changed files or components.
- [ ] Describe checks and tests actually run.
- [ ] Include screenshots or API examples when useful.
- [ ] Confirm the change is scoped to the selected issue.
- [ ] Confirm no secrets or production data were committed.
- [ ] Confirm authentication and authorization remain intact.

## Definition of done

A contribution is ready when the original behavior is reproducible before the fix, the root cause is addressed, the failing scenario passes with regression coverage where practical, related workflows still work, authentication and authorization remain intact, relevant builds/checks pass, and no unrelated changes or secrets are included. Update documentation when behavior or setup changes.

## Maintainer notes

Keep each CP ID unique and update this catalogue whenever source behavior changes. When a GitHub issue is created, link it here and keep status aligned with its actual availability. Review focused changes, verify the reproduction and permissions, close the corresponding issue after merge, and remove or mark resolved defects so contributors do not chase stale behavior. Add regression coverage as the project gains test infrastructure. Keep credentials and private operational details out of public docs.
