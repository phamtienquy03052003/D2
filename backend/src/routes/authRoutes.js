import express from "express";
import { register, login, refreshToken, logout, googleLogin, forgotPassword, resetPassword, } from "../controllers/authController.js";

const router = express.Router();

router.post("/dangky", register);
router.post("/dangnhap", login);
router.post("/google", googleLogin);
router.post("/refresh", refreshToken);
router.post("/dangxuat", logout);
router.post("/quenmatkhau", forgotPassword);
router.post("/datlaimatkhau", resetPassword);

export default router;
