import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import {
  attendanceSummary,
  classRoster,
  listAttendance,
  saveAttendance,
  studentAttendanceStats,
} from "../controllers/attendanceController.js";

const router = Router();
router.get("/", listAttendance);
router.get("/summary", attendanceSummary);
router.get("/students", allowRoles("faculty", "admin"), studentAttendanceStats);
router.get("/roster", allowRoles("faculty", "admin"), classRoster);
router.post("/", allowRoles("faculty", "admin"), saveAttendance);

export default router;
