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

export const validateSendMessage = [
    body("conversationId")
        .isMongoId()
        .withMessage("ID cuộc trò chuyện không hợp lệ"),
    body("senderId")
        .isMongoId()
        .withMessage("ID người gửi không hợp lệ"),
    body("type")
        .optional()
        .isIn(["text", "image", "file"])
        .withMessage("Loại tin nhắn không hợp lệ"),
    body("content")
        .if(body("type").equals("text"))
        .trim()
        .notEmpty()
        .withMessage("Nội dung tin nhắn không được để trống"),
    body("fileUrl")
        .if(body("type").isIn(["image", "file"]))
        .notEmpty()
        .withMessage("URL file không được để trống"),
    validate,
];

export const validateMarkAsRead = [
    param("conversationId")
        .isMongoId()
        .withMessage("ID cuộc trò chuyện không hợp lệ"),
    body("userId")
        .isMongoId()
        .withMessage("ID người dùng không hợp lệ"),
    body("lastReadMessageId")
        .optional()
        .isMongoId()
        .withMessage("ID tin nhắn không hợp lệ"),
    validate,
];

export const validateToggleReaction = [
    param("messageId")
        .isMongoId()
        .withMessage("ID tin nhắn không hợp lệ"),
    body("userId")
        .isMongoId()
        .withMessage("ID người dùng không hợp lệ"),
    body("emoji")
        .notEmpty()
        .withMessage("Emoji không được để trống"),
    validate,
];

export const validateSearchMessages = [
    param("conversationId")
        .isMongoId()
        .withMessage("ID cuộc trò chuyện không hợp lệ"),
    query("q")
        .trim()
        .notEmpty()
        .withMessage("Từ khóa tìm kiếm không được để trống"),
    validate,
];
