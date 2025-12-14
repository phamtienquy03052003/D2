import express from "express";
import * as messageController from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
    validateSendMessage,
    validateMarkAsRead,
    validateToggleReaction,
    validateSearchMessages
} from "../validators/messageValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, validateSendMessage, validateRequest, messageController.sendMessage);
router.get("/:conversationId", verifyToken, messageController.getMessages);
router.patch("/:conversationId/read", verifyToken, validateMarkAsRead, validateRequest, messageController.markAsRead);
router.put("/:messageId/react", verifyToken, validateToggleReaction, validateRequest, messageController.toggleReaction);
router.get("/:conversationId/search", verifyToken, validateSearchMessages, validateRequest, messageController.searchMessages);

export default router;
