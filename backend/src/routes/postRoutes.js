import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createPost, getAllPosts, getPostById, updatePost, deletePost, votePost, } from "../controllers/postController.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.post("/:id/vote", verifyToken, votePost);

export default router;
