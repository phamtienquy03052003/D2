import express from "express";
import * as conversationController from "../controllers/conversationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
    validateCreatePrivateConversation,
    validateCreateGroupConversation,
    validateUpdateGroupMembers
} from "../validators/conversationValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * Routes hội thoại (Conversations)
 */

router.post("/private", verifyToken, validateCreatePrivateConversation, validateRequest, conversationController.createPrivateConversation); // Tạo chat 1-1
router.post("/group", verifyToken, validateCreateGroupConversation, validateRequest, conversationController.createGroupConversation); // Tạo nhóm chat
router.get("/user/:userId", verifyToken, conversationController.getUserConversations); // Lấy danh sách hội thoại
router.get("/detail/:conversationId", verifyToken, conversationController.getConversationById); // Chi tiết hội thoại (Kèm tin nhắn)

// Quản lý nhóm
router.patch("/group/:conversationId/members", verifyToken, validateUpdateGroupMembers, validateRequest, conversationController.updateGroupMembers); // Thêm/Xóa thành viên
router.post("/:conversationId/accept", verifyToken, conversationController.acceptConversation); // Chấp nhận lời mời
router.post("/:conversationId/reject", verifyToken, conversationController.rejectConversation); // Từ chối lời mời

export default router;
