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

router.post("/private", verifyToken, validateCreatePrivateConversation, validateRequest, conversationController.createPrivateConversation);
router.post("/group", verifyToken, validateCreateGroupConversation, validateRequest, conversationController.createGroupConversation);
router.get("/user/:userId", verifyToken, conversationController.getUserConversations);
router.get("/detail/:conversationId", verifyToken, conversationController.getConversationById);
router.patch("/group/:conversationId/members", verifyToken, validateUpdateGroupMembers, validateRequest, conversationController.updateGroupMembers);
router.post("/:conversationId/accept", verifyToken, conversationController.acceptConversation);
router.post("/:conversationId/reject", verifyToken, conversationController.rejectConversation);

export default router;
