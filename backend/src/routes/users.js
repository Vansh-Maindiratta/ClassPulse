import { Router } from "express";
import { getUser, listUsers } from "../controllers/userController.js";
import { allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", allowRoles("faculty", "admin"), listUsers);
router.get("/:id", allowRoles("faculty", "admin"), getUser);

export default router;
