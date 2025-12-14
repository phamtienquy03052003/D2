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


router.post("/communities/:communityId/modmail", verifyToken, createConversationValidator, validateRequest, createConversation);


router.get("/modmail/user", verifyToken, getConversationsForUser);


router.get("/communities/:communityId/modmail", verifyToken, getConversationsForMods);


router.get("/communities/:communityId/modmail/search", verifyToken, searchConversations);


router.get("/communities/all/modmail/stats", verifyToken, getAllManagedStats);
router.get("/communities/:communityId/modmail/stats", verifyToken, getStats);


router.get("/modmail/managed/conversations", verifyToken, getAllManagedConversations);


router.get("/modmail/managed/stats", verifyToken, getAllManagedStats);


router.get("/modmail/:conversationId", verifyToken, getMessages);


router.post("/modmail/:conversationId/messages", verifyToken, sendMessageValidator, validateRequest, sendMessage);


router.patch("/modmail/:conversationId", verifyToken, updateConversationValidator, validateRequest, updateConversation);


router.patch("/modmail/:conversationId/assign", verifyToken, assignConversationValidator, validateRequest, assignConversation);


router.patch("/modmail/:conversationId/archive", verifyToken, archiveConversation);


router.patch("/modmail/:conversationId/priority", verifyToken, updatePriorityValidator, validateRequest, updatePriority);


router.delete("/modmail/:conversationId", verifyToken, deleteConversation);

export default router;
