import { body } from "express-validator";

/**
 * Validate Gửi mã xác nhận đăng ký (Step 1)
 */
export const validateSendRegisterCode = [
    body("email").isEmail().withMessage("Email không hợp lệ"),
];

/**
 * Validate Xác thực mã đăng ký (Step 2)
 */
export const validateVerifyRegisterCode = [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("code").notEmpty().withMessage("Vui lòng nhập mã xác nhận"),
];

/**
 * Validate Đăng ký tài khoản (Step 3 - Final)
 */
export const validateRegisterFinal = [
    body("registerToken").notEmpty().withMessage("Token đăng ký bị thiếu"),
    body("name").notEmpty().withMessage("Tên không được để trống"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
];

export const validateLogin = [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
];

export const validateForgotPassword = [
    body("email").isEmail().withMessage("Email không hợp lệ"),
];

export const validateResetPassword = [
    body("token").notEmpty().withMessage("Token không được để trống"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),
];
