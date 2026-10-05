import ClassModel from "../models/Class.js";

export async function listClasses(req, res, next) {
  try {
    const filter = {};
    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.subject) filter.subject = req.query.subject;

    const classes = await ClassModel.find(filter)
      .populate("subject", "name code")
      .populate("faculty", "name email")
      .sort({ "schedule.time": 1 });

    res.json(classes);
  } catch (error) {
    next(error);
  }
}
