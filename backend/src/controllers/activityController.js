import Activity from "../models/Activity.js";

function withDerivedStatus(activity) {
  const data = activity.toObject ? activity.toObject() : activity;
  const due = new Date(data.dueDate);
  const done = data.status === "completed" || data.status === "submitted";
  if (!done && due < new Date()) {
    data.status = "overdue";
  }
  return data;
}

export async function listActivities(req, res, next) {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;

    const activities = await Activity.find(filter)
      .populate("subject", "name code")
      .populate("createdBy", "name role")
      .sort({ dueDate: 1 });

    res.json(activities.map(withDerivedStatus));
  } catch (error) {
    next(error);
  }
}

export async function createActivity(req, res, next) {
  try {
    const { title, description, subject, type, dueDate, createdBy } = req.body;
    const due = new Date(dueDate);

    if (Number.isNaN(due.getTime())) {
      return res.status(400).json({ message: "Please choose a valid due date." });
    }

    const activity = await Activity.create({
      title: title.trim(),
      description: (description || "").trim(),
      subject,
      type,
      dueDate: due,
      createdBy,
      status: "pending",
    });

    const populated = await activity.populate([
      { path: "subject", select: "name code" },
      { path: "createdBy", select: "name role" },
    ]);

    res.status(201).json(withDerivedStatus(populated));
  } catch (error) {
    next(error);
  }
}

export async function updateActivity(req, res, next) {
  try {
    const updates = {};
    const allowed = ["title", "description", "subject", "type", "dueDate", "status"];

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.title) updates.title = String(updates.title).trim();
    if (updates.description) updates.description = String(updates.description).trim();
    if (updates.dueDate) {
      const due = new Date(updates.dueDate);
      if (Number.isNaN(due.getTime())) {
        return res.status(400).json({ message: "Please choose a valid due date." });
      }
      updates.dueDate = due;
    }

    const activity = await Activity.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("subject", "name code")
      .populate("createdBy", "name role");

    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    res.json(withDerivedStatus(activity));
  } catch (error) {
    next(error);
  }
}
