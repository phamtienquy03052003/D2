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


router.use(verifyToken, isAdmin);


router.get("/stats", getDashboardStats);
router.get("/stats/advanced", getAdvancedStats);
router.get("/stats/follow", getFollowStats);


router.get("/users/stats", getUserStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.put("/users/:id/reset-name", resetUserName);
router.delete("/users/:id/avatar", deleteUserAvatar);


router.get("/posts/stats", getContentStats);
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

router.get("/comments/stats", getCommentStats);
router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

router.get("/communities/stats", getCommunityStats);
router.get("/communities", getAllCommunities);
router.delete("/communities/:id", deleteCommunity);


router.get("/points", getUsersPoints);


router.get("/user-points", getAllUserPoints);
router.post("/user-points/update", updateUserPointBalance);
router.get("/user-points/history/:userId", getUserPointHistory);


router.get("/reports", getReports);
router.patch("/reports/:id", updateReportStatus);


router.get("/edited-content", getEditedPosts);


router.get("/shop/items", getShopItems);
router.post("/shop/items", createShopItem);
router.put("/shop/items/:id", updateShopItem);
router.delete("/shop/items/:id", deleteShopItem);
router.get("/shop/purchases", getPurchaseHistory);
router.get("/shop/revenue", getShopRevenue);


router.get("/modmail/all", getAllModMailConversations);
router.get("/modmail/stats", getModMailStats);
router.get("/modmail/moderator-performance", getModeratorPerformance);


router.get("/moderator-logs", getAllModeratorLogs);
router.get("/moderator-logs/user/:userId", getModeratorLogsByUser);
router.get("/moderator-logs/community/:communityId", getModeratorLogsByCommunity);


router.post("/bulk/soft-delete-posts", bulkSoftDeletePosts);
router.post("/bulk/soft-delete-comments", bulkSoftDeleteComments);
router.post("/bulk/update-users", bulkUpdateUserStatus);


router.get("/export/users", exportUsers);
router.get("/export/posts", exportPosts);
router.get("/export/reports", exportReports);


router.get("/audit-logs", getAuditLogs);


router.get("/config", getSystemConfigs);
router.get("/config/:key", getConfigByKey);
router.patch("/config/:key", updateSystemConfig);


router.post("/notifications/broadcast", createBroadcastNotification);
router.post("/notifications/bulk-delete", bulkDeleteNotifications);

export default router;
