import { Router } from "express";
import { listCurriculum, updateCurriculum } from "../controllers/curriculumController.js";
import { allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", listCurriculum);
router.put("/:id", allowRoles("faculty", "admin"), updateCurriculum);

export default router;
