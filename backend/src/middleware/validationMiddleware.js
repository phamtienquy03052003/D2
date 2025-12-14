import { validationResult } from "express-validator";

/**
 * Middleware kiểm tra lỗi validation (Express Validator)
 * - Nếu có lỗi, trả về 400 Bad Request và danh sách lỗi.
 * - Nếu không, next().
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array(),
        });
    }
    next();
};
