import { body, param } from "express-validator";

export const validateCreateComment = [
    body("content")
        .optional()
        .isLength({ max: 2000 }).withMessage("Nội dung bình luận không được vượt quá 2000 ký tự"),
    param("postId").isMongoId().withMessage("ID bài viết không hợp lệ"),
];

export const validateUpdateComment = [
    body("content")
        .optional()
        .isLength({ max: 2000 }).withMessage("Nội dung bình luận không được vượt quá 2000 ký tự"),
];
