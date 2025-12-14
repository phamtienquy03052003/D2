import { body, param, query, validationResult } from "express-validator";

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

export const createConversationValidator = [
    param("communityId").isMongoId().withMessage("Invalid Community ID"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("text").trim().notEmpty().withMessage("Message text is required"),
    validate,
];

export const sendMessageValidator = [
    param("conversationId").isMongoId().withMessage("Invalid Conversation ID"),
    body("text").trim().notEmpty().withMessage("Message text is required"),
    validate,
];

export const updateConversationValidator = [
    param("conversationId").isMongoId().withMessage("Invalid Conversation ID"),
    body("status").optional().isIn(["open", "pending", "closed"]).withMessage("Invalid status"),
    body("assignee").optional().custom((value) => {
        if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid Assignee ID");
        }
        return true;
    }),
    validate,
];

export const assignConversationValidator = [
    param("conversationId").isMongoId().withMessage("Invalid Conversation ID"),
    body("assigneeId").optional({ nullable: true }).isMongoId().withMessage("Invalid Assignee ID"),
    validate,
];

export const updatePriorityValidator = [
    param("conversationId").isMongoId().withMessage("Invalid Conversation ID"),
    body("priority").isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid priority"),
    validate,
];
