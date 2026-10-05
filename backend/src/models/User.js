import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "faculty", "admin"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
