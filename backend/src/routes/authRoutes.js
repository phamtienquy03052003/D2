import express from "express";
import { register, login, refreshToken, logout, googleLogin, forgotPassword, resetPassword, } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../validators/authValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, validateRequest, register);
router.post("/login", validateLogin, validateRequest, login);
router.post("/google", googleLogin);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/forgotPassword", validateForgotPassword, validateRequest, forgotPassword);
router.post("/resetPassword", validateResetPassword, validateRequest, resetPassword);

export default router;
