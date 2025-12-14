import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
    getCommentsByPost,
    createComment,
    toggleLikeDislike,
    deleteComment,
    updateComment,
    adminGetAllComments,
    adminDeleteComment,
    getCommentsByUser,
    getLikedComments,
    getDislikedComments,
    getRemovedForModeration,
    getEditedForModeration,
    moderateComment,
    markEditedCommentSeen
} from "../controllers/commentController.js";
import { validateCreateComment, validateUpdateComment } from "../validators/commentValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { uploadCommentImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- Admin ---
router.get("/admin/", verifyToken, isAdmin, adminGetAllComments);
router.delete("/admin/:commentId", verifyToken, isAdmin, adminDeleteComment);

// --- Bộ lọc cá nhân ---
router.get("/user/:userId", getCommentsByUser); // Comment của user
router.get("/liked/all", verifyToken, getLikedComments); // Comment đã like
router.get("/disliked/all", verifyToken, getDislikedComments); // Comment đã dislike

// --- Moderation (Kiểm duyệt) ---
router.get("/moderation/removed", verifyToken, getRemovedForModeration);
router.get("/moderation/edited", verifyToken, getEditedForModeration);
router.post("/:commentId/moderate", verifyToken, moderateComment); // Duyệt/Xóa comment
router.post("/:commentId/seen", verifyToken, markEditedCommentSeen);

// --- CRUD Comment ---
router.get("/:postId", getCommentsByPost); // Lấy comment của bài viết
router.post("/:postId", uploadCommentImage, verifyToken, validateCreateComment, validateRequest, createComment); // Bình luận
router.post("/:commentId/react", verifyToken, toggleLikeDislike); // Like/Dislike
router.put("/:commentId", uploadCommentImage, verifyToken, validateUpdateComment, validateRequest, updateComment); // Sửa bình luận
router.delete("/:commentId", verifyToken, deleteComment); // Xóa bình luận

export default router;
