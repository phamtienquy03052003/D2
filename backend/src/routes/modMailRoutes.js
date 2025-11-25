import express from "express";
import {
  createConversation,
  getConversationsForUser,
  getConversationsForMods,
  getMessages,
  sendMessage,
  updateConversation,
} from "../controllers/modMailController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER TẠO CONVERSATION
router.post( "/communities/:communityId/modmail", verifyToken, createConversation);

// USER LẤY LIST CONVERSATIONS CỦA HỌ
router.get("/modmail/user", verifyToken, getConversationsForUser);

// MOD LẤY LIST
router.get("/communities/:communityId/modmail", verifyToken, getConversationsForMods);

// LẤY MESSAGES
router.get("/modmail/:conversationId", verifyToken, getMessages);

// GỬI TIN NHẮN
router.post("/modmail/:conversationId/messages", verifyToken, sendMessage);

// UPDATE STATUS / ASSIGNEE
router.patch("/modmail/:conversationId", verifyToken, updateConversation);

export default router;
