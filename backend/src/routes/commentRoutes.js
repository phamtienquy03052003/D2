import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { getCommentsByPost, createComment, toggleLikeDislike, deleteComment, updateComment, getAllComments } from "../controllers/commentController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllComments);

router.get("/:postId", getCommentsByPost);
router.post("/:postId", verifyToken, createComment);
router.post("/:commentId/react", verifyToken, toggleLikeDislike);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
