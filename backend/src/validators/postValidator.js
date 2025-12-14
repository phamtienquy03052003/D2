import { body, param } from "express-validator";

export const validateCreatePost = [
    body("title")
        .notEmpty().withMessage("Tiêu đề không được để trống")
        .isLength({ min: 3, max: 300 }).withMessage("Tiêu đề phải từ 3 đến 300 ký tự"),
    body("content")
        .optional()
        .isLength({ max: 10000 }).withMessage("Nội dung không được vượt quá 10000 ký tự"),
    body("communityId").optional().isMongoId().withMessage("ID cộng đồng không hợp lệ"),
];

export const validateUpdatePost = [
    body("title")
        .optional()
        .notEmpty().withMessage("Tiêu đề không được để trống")
        .isLength({ min: 3, max: 300 }).withMessage("Tiêu đề phải từ 3 đến 300 ký tự"),
    body("content")
        .optional()
        .isLength({ max: 10000 }).withMessage("Nội dung không được vượt quá 10000 ký tự"),
];

export const validateLockPost = [
    param("id").notEmpty().withMessage("ID bài viết không được để trống"),
];
