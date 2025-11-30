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

const router = express.Router();

router.get("/admin/", verifyToken, isAdmin, adminGetAllComments);
router.delete("/admin/:commentId", verifyToken, isAdmin, adminDeleteComment);

router.get("/user/:userId", getCommentsByUser);
router.get("/liked/all", verifyToken, getLikedComments);
router.get("/disliked/all", verifyToken, getDislikedComments);

router.get("/moderation/removed", verifyToken, getRemovedForModeration);
router.get("/moderation/edited", verifyToken, getEditedForModeration);
router.post("/:commentId/moderate", verifyToken, moderateComment);
router.post("/:commentId/seen", verifyToken, markEditedCommentSeen);

router.get("/:postId", getCommentsByPost);
router.post("/:postId", verifyToken, createComment);
router.post("/:commentId/react", verifyToken, toggleLikeDislike);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
