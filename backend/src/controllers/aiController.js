import { facultyInsight, studentInsight, summarizeActivity } from "../services/aiService.js";
import Attendance from "../models/Attendance.js";
import { analyzeAcademicRisk } from "../services/riskAnalysisService.js";

export async function risk(req, res, next) {
  try {
    const studentId = req.user.role === "student" ? req.user._id : req.query.student;
    if (!studentId) return res.status(400).json({ message: "Choose a student to analyze." });
    const records = await Attendance.find({ student: studentId });
    const total = records.length;
    const present = records.filter((record) => record.status === "present").length;
    const result = analyzeAcademicRisk({ attendancePercent: total ? (present / total) * 100 : null });
    res.json({ ...result, attendance: total ? Math.round((present / total) * 100) : null, message: total ? undefined : "Not enough academic data for a risk estimate yet." });
  } catch (error) { next(error); }
}

export async function insight(req, res, next) {
  try {
    const { role } = req.body;
    if (role === "faculty") {
      const result = await facultyInsight(req.body);
      return res.json(result);
    }

    const result = await studentInsight(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function summarize(req, res, next) {
  try {
    const text = req.body?.text;
    if (!text || !String(text).trim()) {
      return res.status(400).json({
        message: "Please enter a short description to summarize.",
      });
    }

    const result = await summarizeActivity(String(text).trim());
    res.json(result);
  } catch (error) {
    next(error);
  }
}
