import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, refreshToken, logout } from "../controllers/authController.js";

const router = express.Router();

// Giới hạn đăng ký & đăng nhập
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || "10");
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5");

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW * 60 * 1000,
  max: RATE_LIMIT_MAX,
  message: {
    success: false,
    message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${RATE_LIMIT_WINDOW} phút.`,
  },
});

router.post("/dangky", authLimiter, register);
router.post("/dangnhap", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/dangxuat", logout);

export default router;