import { body } from "express-validator";

export const validateRegister = [
    body("email").isEmail().withMessage("Email không hợp lệ"),
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
