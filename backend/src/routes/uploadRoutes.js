import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadUserAvatar, uploadCommunityAvatar } from "../middleware/uploadMiddleware.js";
import { updateUserAvatar, updateCommunityAvatar } from "../controllers/uploadController.js";

const router = express.Router();

// Upload avatar user
router.post("/user/avatar", verifyToken, uploadUserAvatar.single("avatar"), updateUserAvatar);

// Upload avatar community
router.post("/community/avatar", verifyToken, uploadCommunityAvatar.single("avatar"), updateCommunityAvatar);

export default router;
