import { useMemo, useState } from "react";
import { useDemo } from "../hooks/useDemo";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { summarizeActivity } from "../services/ai";
import type { Activity, ActivityStatus, ActivityType, Subject } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { ActivityCard } from "../components/activities/ActivityCard";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState, LoadingState } from "../components/ui/States";

const types: ActivityType[] = ["assignment", "quiz", "lab", "project", "seminar", "tutorial"];

export function Activities() {
  const { session } = useDemo();
  const role = session!.role;
  const activities = useApi(
    () =>
      api.get<Activity[]>(
        role === "faculty" ? `/activities?createdBy=${session!.user._id}` : "/activities"
      ),
    [role, session!.user._id]
  );
  const subjects = useApi(() => api.get<Subject[]>("/subjects"), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  if (activities.loading) return <LoadingState label="Loading activities..." />;
  if (activities.error) return <ErrorState message={activities.error} onRetry={activities.reload} />;

  const mineSubjects = (subjects.data ?? []).filter((subject) => {
    const facultyId = typeof subject.faculty === "object" ? subject.faculty._id : subject.faculty;
    return role !== "faculty" || facultyId === session!.user._id;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Assignments, labs, quizzes, and more."
        action={
          role === "faculty" ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Create Activity
            </Button>
          ) : null
        }
      />

      {activities.data?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {activities.data.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onClick={
                role === "faculty"
                  ? () => {
                      setEditing(activity);
                      setOpen(true);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activities yet."
          description="Your faculty hasn't added any activities for this subject."
        />
      )}

      {open && role === "faculty" ? (
        <ActivityForm
          subjects={mineSubjects}
          activity={editing}
          createdBy={session!.user._id}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            if (!editing) void activities.reload();
          }}
        />
      ) : null}
    </div>
  );
}

function ActivityForm({
  subjects,
  activity,
  createdBy,
  onClose,
  onSaved,
}: {
  subjects: Subject[];
  activity: Activity | null;
  createdBy: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [subject, setSubject] = useState(activity?.subject._id ?? subjects[0]?._id ?? "");
  const [type, setType] = useState<ActivityType>(activity?.type ?? "assignment");
  const [dueDate, setDueDate] = useState(activity?.dueDate?.slice(0, 10) ?? "");
  const [status, setStatus] = useState<ActivityStatus>(activity?.status ?? "pending");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const canSave = useMemo(() => title.trim() && subject && type && dueDate, [title, subject, type, dueDate]);

  function validate() {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Please add a title.";
    else if (title.trim().length < 2) next.title = "Title must contain at least 2 characters.";
    if (!subject) next.subject = "Please choose a subject.";
    if (!type) next.type = "Please choose an activity type.";
    if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) {
      next.dueDate = "Please choose a valid due date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate() || !canSave) return;
    setSaving(true);
    try {
      if (activity) {
        await api.put(`/activities/${activity._id}`, {
          title,
          description,
          subject,
          type,
          dueDate,
          status,
        });
      } else {
        await api.post("/activities", { title, description, subject, type, dueDate, createdBy });
      }
      onSaved();
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Couldn't save this activity.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function summarize() {
    if (!description.trim()) {
      setErrors({ description: "Write a short description first." });
      return;
    }
    setSummarizing(true);
    try {
      const result = await summarizeActivity(description);
      setDescription(result.text);
    } catch {
      setErrors({ description: "Couldn't summarize right now. You can keep your original text." });
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <Modal title={activity ? "Edit Activity" : "Create Activity"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description}>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Button type="button" variant="secondary" onClick={summarize} disabled={summarizing}>
          {summarizing ? "Summarizing..." : "Summarize with AI"}
        </Button>
        <Field label="Subject" htmlFor="subject" error={errors.subject}>
          <Select id="subject" value={subject} onChange={(event) => setSubject(event.target.value)}>
            {subjects.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Activity Type" htmlFor="type" error={errors.type}>
          <Select
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value as ActivityType)}
          >
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due Date" htmlFor="dueDate" error={errors.dueDate}>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </Field>
        {activity ? (
          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ActivityStatus)}
            >
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </Select>
          </Field>
        ) : null}
        {errors.form ? <p className="text-sm text-danger">{errors.form}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary">
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : activity ? "Save changes" : "Create Activity"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
