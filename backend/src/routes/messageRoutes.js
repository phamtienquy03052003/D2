import express from "express";
import * as messageController from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, messageController.sendMessage);
router.get("/:conversationId", verifyToken, messageController.getMessages);
router.patch("/:conversationId/read", verifyToken, messageController.markAsRead);

export default router;
