import express from "express";
import {
  createConversation,
  getConversationsForUser,
  getConversationsForMods,
  getMessages,
  sendMessage,
  updateConversation,
  deleteConversation,
  searchConversations,
  getStats,
  assignConversation,
  archiveConversation,
  updatePriority,
  getAllManagedConversations,
  getAllManagedStats,
} from "../controllers/modMailController.js";
import {
  createConversationValidator,
  sendMessageValidator,
  updateConversationValidator,
  assignConversationValidator,
  updatePriorityValidator,
} from "../validators/modMailValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * Routes Modmail
 * - Hệ thống hỗ trợ/khiếu nại giữa User và Mod Team
 */

// User tạo yêu cầu mới
router.post("/communities/:communityId/modmail", verifyToken, createConversationValidator, validateRequest, createConversation);

// User xem danh sách yêu cầu của mình
router.get("/modmail/user", verifyToken, getConversationsForUser);

// Mod xem danh sách yêu cầu trong cộng đồng
router.get("/communities/:communityId/modmail", verifyToken, getConversationsForMods);

// Mod tìm kiếm yêu cầu
router.get("/communities/:communityId/modmail/search", verifyToken, searchConversations);

// Thống kê Modmail
router.get("/communities/all/modmail/stats", verifyToken, getAllManagedStats);
router.get("/communities/:communityId/modmail/stats", verifyToken, getStats);

// Lấy tất cả hội thoại đang quản lý
router.get("/modmail/managed/conversations", verifyToken, getAllManagedConversations);
router.get("/modmail/managed/stats", verifyToken, getAllManagedStats);

// Xem nội dung hội thoại
router.get("/modmail/:conversationId", verifyToken, getMessages);

// Gửi tin nhắn trả lời
router.post("/modmail/:conversationId/messages", verifyToken, sendMessageValidator, validateRequest, sendMessage);

// Cập nhật trạng thái hội thoại (Open/Pending/Closed)
router.patch("/modmail/:conversationId", verifyToken, updateConversationValidator, validateRequest, updateConversation);

// Phân công Mod xử lý
router.patch("/modmail/:conversationId/assign", verifyToken, assignConversationValidator, validateRequest, assignConversation);

// Lưu trữ (Archive)
router.patch("/modmail/:conversationId/archive", verifyToken, archiveConversation);

// Cập nhật độ ưu tiên
router.patch("/modmail/:conversationId/priority", verifyToken, updatePriorityValidator, validateRequest, updatePriority);

// Xóa hội thoại
router.delete("/modmail/:conversationId", verifyToken, deleteConversation);

export default router;
