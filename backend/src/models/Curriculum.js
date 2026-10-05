import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { _id: true }
);

const unitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    topics: [topicSchema],
  },
  { _id: true }
);

const curriculumSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      unique: true,
    },
    units: [unitSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Curriculum", curriculumSchema);
