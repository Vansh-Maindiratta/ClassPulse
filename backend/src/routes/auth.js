import { Router } from "express";
import { login, me, registerStudent } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.post("/login", login);
router.post("/register", registerStudent);
router.get("/me", authenticate, me);
export default router;
