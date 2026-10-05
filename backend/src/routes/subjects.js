import { Router } from "express";
import { getSubject, listSubjects } from "../controllers/subjectController.js";
import { allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", allowRoles("student", "faculty", "admin"), listSubjects);
router.get("/:id", allowRoles("student", "faculty", "admin"), getSubject);

export default router;
