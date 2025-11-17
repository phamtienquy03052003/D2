import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
  updatePassword,
  getUserPublic,
  updatePrivacy ,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy thông tin user hiện tại
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateProfile);
router.put("/me/privacy", verifyToken, updatePrivacy);
router.put("/me/password", verifyToken, updatePassword);

// Lấy thông tin user public
router.get("/public/:id", getUserPublic);

// Quản lý người dùng (Admin)
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
