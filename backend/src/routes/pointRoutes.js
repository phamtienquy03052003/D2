import express from "express";
import { getUserPoints, getUserPointHistory, adminGetAllPoints, adminDeletePointHistory, } from "../controllers/pointController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Routes điểm thưởng (Points)
 */

// --- Admin ---
router.get("/admin", verifyToken, isAdmin, adminGetAllPoints);
router.delete("/admin/:historyId", verifyToken, isAdmin, adminDeletePointHistory);

// --- User ---
router.get("/total", verifyToken, getUserPoints); // Lấy tổng điểm
router.get("/history", verifyToken, getUserPointHistory); // Lấy lịch sử điểm

export default router;
