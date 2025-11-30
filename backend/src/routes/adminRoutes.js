import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    // deleteUser,
    getAllPosts,
    deletePost,
    getAllComments,
    deleteComment,
    getAllCommunities,
    deleteCommunity,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả các route admin đều cần đăng nhập và có quyền admin
router.use(verifyToken, isAdmin);

router.get("/stats", getDashboardStats);

// Quản lý người dùng
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);

// Quản lý bài viết
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

// Quản lý bình luận
router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

// Quản lý cộng đồng
router.get("/communities", getAllCommunities);
router.delete("/communities/:id", deleteCommunity);

export default router;
