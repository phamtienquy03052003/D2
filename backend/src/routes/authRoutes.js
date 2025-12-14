import express from "express";
import {
    register,
    login,
    refreshToken,
    logout,
    googleLogin,
    forgotPassword,
    resetPassword,
    sendRegisterCode,
    verifyRegisterCode
} from "../controllers/authController.js";
import {
    validateSendRegisterCode,
    validateVerifyRegisterCode,
    validateRegisterFinal,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} from "../validators/authValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * Routes xác thực (Authentication)
 */

// Quy trình đăng ký mới (3 bước)
router.post("/send-code", validateSendRegisterCode, validateRequest, sendRegisterCode);
router.post("/verify-code", validateVerifyRegisterCode, validateRequest, verifyRegisterCode);
router.post("/register", validateRegisterFinal, validateRequest, register);

// Đăng nhập
router.post("/login", validateLogin, validateRequest, login);
router.post("/google", googleLogin); // Đăng nhập Google

// Token management
router.post("/refresh", refreshToken); // Cấp lại Access Token
router.post("/logout", logout); // Đăng xuất

// Quên mật khẩu
router.post("/forgotPassword", validateForgotPassword, validateRequest, forgotPassword);
router.post("/resetPassword", validateResetPassword, validateRequest, resetPassword);

export default router;
