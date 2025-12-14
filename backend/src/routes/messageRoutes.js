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

/**
 * Routes tin nhắn (Messages)
 */

router.post("/", verifyToken, validateSendMessage, validateRequest, messageController.sendMessage); // Gửi tin nhắn
router.get("/:conversationId", verifyToken, messageController.getMessages); // Lấy tin nhắn (kèm phân trang)
router.patch("/:conversationId/read", verifyToken, validateMarkAsRead, validateRequest, messageController.markAsRead); // Đánh dấu đã đọc
router.put("/:messageId/react", verifyToken, validateToggleReaction, validateRequest, messageController.toggleReaction); // Thả cảm xúc
router.get("/:conversationId/search", verifyToken, validateSearchMessages, validateRequest, messageController.searchMessages); // Tìm kiếm tin nhắn

export default router;
