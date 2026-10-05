import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    section: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    schedule: {
      days: [{ type: String, required: true }],
      time: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
