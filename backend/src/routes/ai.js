import { Router } from "express";
import { insight, risk, summarize } from "../controllers/aiController.js";
import { allowRoles } from "../middleware/auth.js";

const router = Router();
router.post("/insight", insight);
router.post("/summarize", summarize);
router.get("/risk", allowRoles("student", "faculty", "admin"), risk);

export default router;
