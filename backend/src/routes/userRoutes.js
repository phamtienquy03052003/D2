import express from "express";
import { getAllUsers, updateUser, deleteUser, getMe, updateProfile } from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateProfile);

// Chỉ admin được truy cập
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
