import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getShopItems, buyItem } from "../controllers/shopController.js";

const router = express.Router();

router.get("/", getShopItems);
router.post("/buy", verifyToken, buyItem);

export default router;
