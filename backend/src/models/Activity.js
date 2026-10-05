import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["assignment", "quiz", "lab", "project", "seminar", "tutorial"],
    },
    dueDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "completed", "overdue"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
