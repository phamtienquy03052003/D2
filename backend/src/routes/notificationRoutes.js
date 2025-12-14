import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { getUnreadNotifications, getNotifications, markAsRead, markOneAsRead, deleteUserNotification, adminGetAllNotifications, adminDeleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

/**
 * Routes thông báo (Notifications)
 */

router.get("/", verifyToken, getNotifications); // Lấy tất cả thông báo
router.get("/unread/latest", verifyToken, getUnreadNotifications); // Lấy thông báo chưa đọc mới nhất
router.put("/read", verifyToken, markAsRead); // Đánh dấu tất cả đã đọc
router.put("/read/:id", verifyToken, markOneAsRead); // Đánh dấu một thông báo đã đọc
router.delete("/:id", verifyToken, deleteUserNotification); // Xóa thông báo

// --- Admin ---
router.get("/admin", verifyToken, isAdmin, adminGetAllNotifications);
router.delete("/admin/:id", verifyToken, isAdmin, adminDeleteNotification);

export default router;
