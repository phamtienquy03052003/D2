import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { buyXP, getShopItems, buyNameTag } from "../controllers/shopController.js";

const router = express.Router();

router.get("/", verifyToken, getShopItems);
router.post("/buy-xp", verifyToken, buyXP);
router.post("/buy-nametag", verifyToken, buyNameTag);

export default router;
