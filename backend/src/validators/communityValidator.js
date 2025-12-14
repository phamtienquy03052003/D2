import { body } from "express-validator";

export const validateCreateCommunity = [
    body("name")
        .notEmpty()
        .withMessage("Tên cộng đồng không được để trống")
        .isLength({ min: 3, max: 50 })
        .withMessage("Tên cộng đồng phải từ 3 đến 50 ký tự"),
    body("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Mô tả không được vượt quá 500 ký tự"),
];

export const validateUpdateCommunity = [
    body("name")
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage("Tên cộng đồng phải từ 3 đến 50 ký tự"),
    body("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Mô tả không được vượt quá 500 ký tự"),
];
