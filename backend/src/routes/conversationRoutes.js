import express from "express";
import * as conversationController from "../controllers/conversationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/private", verifyToken, conversationController.createPrivateConversation);
router.post("/group", verifyToken, conversationController.createGroupConversation);
router.get("/user/:userId", verifyToken, conversationController.getUserConversations);
router.get("/detail/:conversationId", verifyToken, conversationController.getConversationById);
router.patch("/group/:conversationId/members", verifyToken, conversationController.updateGroupMembers);

export default router;
