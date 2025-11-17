import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  getPostsByUser,
  adminDeletePost,
  getPendingPostsForModeration,
  moderatePost,
  getRemovedPostsForModeration,
  getEditedPostsForModeration,
} from "../controllers/postController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// === ADMIN ROUTES ===
router.delete("/admin/:id", verifyToken, isAdmin, adminDeletePost);

// === MODERATION ROUTES (HÀNG ĐỢI KIỂM DUYỆT) ===
router.get("/moderation/pending", verifyToken, getPendingPostsForModeration);
// --- THÊM 2 ROUTE MỚI ---
router.get("/moderation/removed", verifyToken, getRemovedPostsForModeration);
router.get("/moderation/edited", verifyToken, getEditedPostsForModeration);
// -------------------------

// === GENERAL POST ROUTES ===
router.get("/", getAllPosts);
router.get("/user/:userId", verifyToken, getPostsByUser);
router.get("/:id", getPostById);
router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.post("/:id/vote", verifyToken, votePost);
router.post("/:id/moderate", verifyToken, moderatePost);

export default router;