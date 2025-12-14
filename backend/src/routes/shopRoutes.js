import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getShopItems, buyItem } from "../controllers/shopController.js";

const router = express.Router();

/**
 * Routes cửa hàng (Shop)
 */

router.get("/", getShopItems); // Lấy danh sách vật phẩm
router.post("/buy", verifyToken, buyItem); // Mua vật phẩm

export default router;
