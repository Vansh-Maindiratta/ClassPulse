import Curriculum from "../models/Curriculum.js";

function progressFor(curriculum) {
  const topics = curriculum.units.flatMap((unit) => unit.topics);
  if (!topics.length) return 0;
  const completed = topics.filter((topic) => topic.status === "completed").length;
  return Math.round((completed / topics.length) * 100);
}

export async function listCurriculum(req, res, next) {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;

    const items = await Curriculum.find(filter).populate("subject", "name code faculty");
    res.json(items.map((item) => ({ ...item.toObject(), progress: progressFor(item) })));
  } catch (error) {
    next(error);
  }
}

export async function updateCurriculum(req, res, next) {
  try {
    const { units } = req.body;
    if (!Array.isArray(units)) {
      return res.status(400).json({ message: "Please provide units to update." });
    }

    const curriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      { units },
      { new: true, runValidators: true }
    ).populate("subject", "name code faculty");

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found." });
    }

    res.json({ ...curriculum.toObject(), progress: progressFor(curriculum) });
  } catch (error) {
    next(error);
  }
}
