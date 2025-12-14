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
  getLikedPosts,
  getDislikedPosts,
  markEditedPostSeen,
  getPostHistory,
  toggleLock,
} from "../controllers/postController.js";
import { verifyToken, isAdmin, verifyTokenOptional } from "../middleware/authMiddleware.js";
import { uploadPostImages, uploadPostMedia } from "../middleware/uploadMiddleware.js";
import { validateCreatePost, validateUpdatePost, validateLockPost } from "../validators/postValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

// --- Admin ---
router.delete("/admin/:id", verifyToken, isAdmin, adminDeletePost); // Admin xóa bài

// --- Moderation (Kiểm duyệt) ---
router.get("/moderation/pending", verifyToken, getPendingPostsForModeration); // Bài chờ duyệt
router.get("/moderation/removed", verifyToken, getRemovedPostsForModeration); // Bài bị xóa
router.get("/moderation/edited", verifyToken, getEditedPostsForModeration); // Bài đã sửa

// --- Bộ lọc cá nhân ---
router.get("/saved/all", verifyToken, getSavedPosts); // Bài đã lưu
router.get("/recent/history", verifyToken, getRecentPosts); // Lịch sử xem
router.get("/liked/all", verifyToken, getLikedPosts); // Bài đã Like
router.get("/disliked/all", verifyToken, getDislikedPosts); // Bài đã Dislike
router.get("/user/:userId", verifyTokenOptional, getPostsByUser); // Bài viết của User

// --- Công cộng ---
router.get("/", verifyTokenOptional, getAllPosts); // Lấy danh sách bài viết (New Feed/Community)
router.post("/", verifyToken, uploadPostMedia, validateCreatePost, validateRequest, createPost); // Tạo bài viết mới

// --- Chi tiết bài viết & Tương tác ---
router.post("/:id/seen", verifyToken, markEditedPostSeen); // Đánh dấu đã xem bài sửa
router.get("/:id/history", verifyToken, getPostHistory); // Lịch sử chỉnh sửa
router.get("/:id", verifyTokenOptional, getPostById); // Xem chi tiết
router.put("/:id", verifyToken, uploadPostMedia, validateUpdatePost, validateRequest, updatePost); // Sửa bài
router.delete("/:id", verifyToken, deletePost); // Xóa bài (User/Mod)
router.post("/:id/vote", verifyToken, votePost); // Vote (Love/Dislike)
router.post("/:id/moderate", verifyToken, moderatePost); // Duyệt/Xóa/Yêu cầu sửa (Mod)
router.post("/:id/save", verifyToken, savePost); // Lưu bài
router.delete("/:id/save", verifyToken, unsavePost); // Bỏ lưu
router.patch("/:id/lock", verifyToken, validateLockPost, validateRequest, toggleLock); // Khóa/Mở khóa bài

export default router;