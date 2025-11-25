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
  savePost,
  unsavePost,
  getSavedPosts,
  getRecentPosts,
} from "../controllers/postController.js";
import { verifyToken, isAdmin, verifyTokenOptional } from "../middleware/authMiddleware.js";
import { uploadPostImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// === ADMIN ROUTES ===
router.delete("/admin/:id", verifyToken, isAdmin, adminDeletePost);

// === MODERATION ROUTES (HÀNG ĐỢI KIỂM DUYỆT) ===
router.get("/moderation/pending", verifyToken, getPendingPostsForModeration);
router.get("/moderation/removed", verifyToken, getRemovedPostsForModeration);
router.get("/moderation/edited", verifyToken, getEditedPostsForModeration);

// === GENERAL POST ROUTES ===
router.get("/", getAllPosts);
router.get("/user/:userId", verifyTokenOptional, getPostsByUser);
router.get("/:id", verifyTokenOptional, getPostById);
router.get("/:id", verifyTokenOptional, getPostById);
router.post("/", verifyToken, uploadPostImages.array("images", 4), createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.post("/:id/vote", verifyToken, votePost);
router.post("/:id/moderate", verifyToken, moderatePost);

router.post("/:id/save", verifyToken, savePost);
router.delete("/:id/save", verifyToken, unsavePost);
router.get("/saved/all", verifyToken, getSavedPosts);
router.get("/recent/history", verifyToken, getRecentPosts);

export default router;