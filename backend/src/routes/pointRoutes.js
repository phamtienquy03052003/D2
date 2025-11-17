import express from "express";
import { getUserPoints, getUserPointHistory, getTopContributors, adminGetAllPoints, adminDeletePoint, } from "../controllers/pointController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", verifyToken, isAdmin, adminGetAllPoints);
router.delete("/admin/:pointId", verifyToken, isAdmin, adminDeletePoint);

router.get("/total", verifyToken, getUserPoints);
router.get("/history", verifyToken, getUserPointHistory);
router.get("/top", getTopContributors);

export default router;
