import { Router } from "express";
import { listClasses } from "../controllers/classController.js";

const router = Router();
router.get("/", listClasses);

export default router;
