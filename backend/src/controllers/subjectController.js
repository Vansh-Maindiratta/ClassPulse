import Subject from "../models/Subject.js";

export async function listSubjects(_req, res, next) {
  try {
    const subjects = await Subject.find().populate("faculty", "name email role").sort({
      name: 1,
    });
    res.json(subjects);
  } catch (error) {
    next(error);
  }
}

export async function getSubject(req, res, next) {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      "faculty",
      "name email role"
    );
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }
    res.json(subject);
  } catch (error) {
    next(error);
  }
}
