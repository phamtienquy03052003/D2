import express from "express";
import { verifyToken, isAdmin} from "../middleware/authMiddleware.js";
import {getUnreadNotifications, getNotifications, markAsRead, markOneAsRead, deleteUserNotification, adminGetAllNotifications, adminDeleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread/latest", verifyToken, getUnreadNotifications);
router.put("/read", verifyToken, markAsRead);
router.put("/read/:id", verifyToken, markOneAsRead);
router.delete("/:id", verifyToken, deleteUserNotification);

router.get("/admin", verifyToken, isAdmin, adminGetAllNotifications);
router.delete("/admin/:id", verifyToken, isAdmin, adminDeleteNotification);

export default router;
