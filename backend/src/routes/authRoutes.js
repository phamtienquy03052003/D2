import express from "express";
import { register, login, refreshToken, logout, googleLogin, forgotPassword, resetPassword, } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../validators/authValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * Routes xác thực (Authentication)
 */

// Đăng ký tài khoản
router.post("/register", validateRegister, validateRequest, register);

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
