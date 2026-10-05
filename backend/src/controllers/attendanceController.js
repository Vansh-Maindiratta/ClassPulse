import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

function percent(attended, total) {
  if (!total) return 0;
  return Math.round((attended / total) * 100);
}

export function forecastAttendance(attended, total, upcoming = 4) {
  const estimated = percent(attended + upcoming, total + upcoming);
  return {
    current: percent(attended, total),
    estimated,
    upcoming,
    attended,
    total,
  };
}

export async function listAttendance(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === "student") filter.student = req.user._id;
    else if (req.query.student) filter.student = req.query.student;
    if (req.query.subject) filter.subject = req.query.subject;

    const records = await Attendance.find(filter)
      .populate("student", "name email")
      .populate("subject", "name code")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
}

export async function saveAttendance(req, res, next) {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || !records.length) {
      return res.status(400).json({ message: "Please provide attendance records." });
    }

    const saved = [];
    for (const record of records) {
      if (!record.student || !record.subject || !record.date || !record.status) {
        return res.status(400).json({
          message: "Each record needs student, subject, date, and status.",
        });
      }

      if (!["present", "absent"].includes(record.status)) {
        return res.status(400).json({ message: "Status must be present or absent." });
      }

      const date = new Date(record.date);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: "Please choose a valid date." });
      }

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const doc = await Attendance.findOneAndUpdate(
        { student: record.student, subject: record.subject, date: dayStart },
        { status: record.status },
        { new: true, upsert: true, runValidators: true }
      );
      saved.push(doc);
    }

    res.json(saved);
  } catch (error) {
    next(error);
  }
}

export async function attendanceSummary(req, res, next) {
  try {
    const { student, subject } = req.query;
    const filter = {};
    if (req.user.role === "student") filter.student = req.user._id;
    else if (student) filter.student = student;
    if (subject) filter.subject = subject;

    const records = await Attendance.find(filter).populate("subject", "name code");
    const grouped = new Map();

    for (const record of records) {
      const key = String(record.subject._id);
      if (!grouped.has(key)) {
        grouped.set(key, {
          subject: record.subject,
          attended: 0,
          total: 0,
        });
      }
      const entry = grouped.get(key);
      entry.total += 1;
      if (record.status === "present") entry.attended += 1;
    }

    const bySubject = [...grouped.values()].map((entry) => ({
      ...entry,
      percent: percent(entry.attended, entry.total),
      forecast: forecastAttendance(entry.attended, entry.total),
    }));

    const attended = bySubject.reduce((sum, item) => sum + item.attended, 0);
    const total = bySubject.reduce((sum, item) => sum + item.total, 0);

    res.json({
      overall: percent(attended, total),
      attended,
      total,
      forecast: forecastAttendance(attended, total),
      bySubject,
    });
  } catch (error) {
    next(error);
  }
}

export async function classRoster(req, res, next) {
  try {
    const students = await User.find({ role: "student" }).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
}

// Per-student attendance rollup used by teacher dashboards and analytics.
export async function studentAttendanceStats(req, res, next) {
  try {
    const threshold = Number(req.query.threshold) || 75;

    const grouped = await Attendance.aggregate([
      {
        $group: {
          _id: "$student",
          attended: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    const students = await User.find({ role: "student", active: true })
      .select("name email")
      .sort({ name: 1 });

    const stats = new Map(grouped.map((row) => [String(row._id), row]));

    res.json(
      students.map((student) => {
        const row = stats.get(String(student._id));
        const attended = row?.attended ?? 0;
        const total = row?.total ?? 0;
        const value = percent(attended, total);
        return {
          student: { _id: student._id, name: student.name, email: student.email },
          attended,
          total,
          percent: value,
          belowThreshold: total > 0 && value < threshold,
        };
      })
    );
  } catch (error) {
    next(error);
  }
}
