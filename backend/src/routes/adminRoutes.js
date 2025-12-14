import express from "express";
import {
    getDashboardStats,
    getUserStats,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    resetUserName,
    deleteUserAvatar,
    getContentStats,
    getAllPosts,
    deletePost,
    getCommentStats,
    getAllComments,
    deleteComment,
    getAllCommunities,
    getCommunityStats,
    deleteCommunity,
    getUsersPoints,
    getReports,
    updateReportStatus,
    getEditedPosts,

    getShopItems,
    createShopItem,
    updateShopItem,
    deleteShopItem,
    getPurchaseHistory,
    getShopRevenue,

    getAllModMailConversations,
    getModMailStats,
    getModeratorPerformance,

    getAllModeratorLogs,
    getModeratorLogsByUser,
    getModeratorLogsByCommunity,

    getFollowStats,

    getAdvancedStats,

    bulkSoftDeletePosts,
    bulkSoftDeleteComments,
    bulkUpdateUserStatus,

    getAllUserPoints,
    updateUserPointBalance,
    getUserPointHistory,

    exportUsers,
    exportPosts,
    exportReports,

    getAuditLogs,

    getSystemConfigs,
    updateSystemConfig,
    getConfigByKey,

    createBroadcastNotification,
    bulkDeleteNotifications,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware: Yêu cầu quyền Admin cho tất cả routes bên dưới
router.use(verifyToken, isAdmin);

// --- Dashboard & Stats ---
router.get("/stats", getDashboardStats);
router.get("/stats/advanced", getAdvancedStats);
router.get("/stats/follow", getFollowStats);

// --- Quản lý người dùng (Users) ---
router.get("/users/stats", getUserStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus); // Khóa/Mở khóa tài khoản
router.patch("/users/:id/role", updateUserRole); // Phân quyền
router.put("/users/:id/reset-name", resetUserName); // Reset tên người dùng
router.delete("/users/:id/avatar", deleteUserAvatar); // Xóa avatar vi phạm

// --- Quản lý nội dung (Content) ---
router.get("/posts/stats", getContentStats);
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

router.get("/comments/stats", getCommentStats);
router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

router.get("/communities/stats", getCommunityStats);
router.get("/communities", getAllCommunities);
router.delete("/communities/:id", deleteCommunity);

// --- Điểm thưởng (Points) ---
router.get("/points", getUsersPoints);
router.get("/user-points", getAllUserPoints);
router.post("/user-points/update", updateUserPointBalance); // Cộng/trừ điểm thủ công
router.get("/user-points/history/:userId", getUserPointHistory);

// --- Báo cáo (Reports) ---
router.get("/reports", getReports);
router.patch("/reports/:id", updateReportStatus);

// --- Nội dung đã chỉnh sửa ---
router.get("/edited-content", getEditedPosts);

// --- Cửa hàng (Shop) ---
router.get("/shop/items", getShopItems);
router.post("/shop/items", createShopItem);
router.put("/shop/items/:id", updateShopItem);
router.delete("/shop/items/:id", deleteShopItem);
router.get("/shop/purchases", getPurchaseHistory);
router.get("/shop/revenue", getShopRevenue);

// --- Modmail ---
router.get("/modmail/all", getAllModMailConversations);
router.get("/modmail/stats", getModMailStats);
router.get("/modmail/moderator-performance", getModeratorPerformance);

// --- Moderator Logs ---
router.get("/moderator-logs", getAllModeratorLogs);
router.get("/moderator-logs/user/:userId", getModeratorLogsByUser);
router.get("/moderator-logs/community/:communityId", getModeratorLogsByCommunity);

// --- Thao tác hàng loạt (Bulk Actions) ---
router.post("/bulk/soft-delete-posts", bulkSoftDeletePosts);
router.post("/bulk/soft-delete-comments", bulkSoftDeleteComments);
router.post("/bulk/update-users", bulkUpdateUserStatus);

// --- Export Data ---
router.get("/export/users", exportUsers);
router.get("/export/posts", exportPosts);
router.get("/export/reports", exportReports);

// --- Audit Logs (Admin Activity) ---
router.get("/audit-logs", getAuditLogs);

// --- System Config ---
router.get("/config", getSystemConfigs);
router.get("/config/:key", getConfigByKey);
router.patch("/config/:key", updateSystemConfig);

// --- Notifications ---
router.post("/notifications/broadcast", createBroadcastNotification); // Gửi thông báo tới toàn thể user
router.post("/notifications/bulk-delete", bulkDeleteNotifications);

export default router;
