import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDb, logDbFailure } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import users from "./routes/users.js";
import subjects from "./routes/subjects.js";
import classes from "./routes/classes.js";
import activities from "./routes/activities.js";
import attendance from "./routes/attendance.js";
import curriculum from "./routes/curriculum.js";
import ai from "./routes/ai.js";
import auth from "./routes/auth.js";
import { authenticate } from "./middleware/auth.js";

const app = express();
const port = process.env.PORT || 5000;
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((item) => item.trim()),
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", auth);
app.use("/api", authenticate);
app.use("/api/users", users);
app.use("/api/subjects", subjects);
app.use("/api/classes", classes);
app.use("/api/activities", activities);
app.use("/api/attendance", attendance);
app.use("/api/curriculum", curriculum);
app.use("/api/ai", ai);

app.use(notFound);
app.use(errorHandler);

try {
  await connectDb(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch {
  logDbFailure();
  process.exit(1);
}
