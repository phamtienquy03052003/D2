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


router.delete("/admin/:id", verifyToken, isAdmin, adminDeletePost);


router.get("/moderation/pending", verifyToken, getPendingPostsForModeration);
router.get("/moderation/removed", verifyToken, getRemovedPostsForModeration);
router.get("/moderation/edited", verifyToken, getEditedPostsForModeration);


router.get("/saved/all", verifyToken, getSavedPosts);
router.get("/recent/history", verifyToken, getRecentPosts);
router.get("/liked/all", verifyToken, getLikedPosts);
router.get("/disliked/all", verifyToken, getDislikedPosts);
router.get("/user/:userId", verifyTokenOptional, getPostsByUser);
router.get("/", verifyTokenOptional, getAllPosts);
router.post("/", verifyToken, uploadPostMedia, validateCreatePost, validateRequest, createPost);


router.post("/:id/seen", verifyToken, markEditedPostSeen);
router.get("/:id/history", verifyToken, getPostHistory);
router.get("/:id", verifyTokenOptional, getPostById);
router.put("/:id", verifyToken, uploadPostMedia, validateUpdatePost, validateRequest, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.post("/:id/vote", verifyToken, votePost);
router.post("/:id/moderate", verifyToken, moderatePost);
router.post("/:id/save", verifyToken, savePost);
router.delete("/:id/save", verifyToken, unsavePost);
router.patch("/:id/lock", verifyToken, validateLockPost, validateRequest, toggleLock);

export default router;