import { Router } from "express";
import {
  createActivity,
  listActivities,
  updateActivity,
} from "../controllers/activityController.js";
import { requireFields } from "../middleware/validate.js";
import { allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", listActivities);
router.post(
  "/",
  allowRoles("faculty", "admin"),
  requireFields(["title", "subject", "type", "dueDate", "createdBy"]),
  createActivity
);
router.put("/:id", allowRoles("faculty", "admin"), updateActivity);

export default router;
