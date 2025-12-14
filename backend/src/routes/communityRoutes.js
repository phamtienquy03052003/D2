import express from "express";
import { verifyToken, isAdmin, verifyTokenOptional } from "../middleware/authMiddleware.js";
const authMiddleware = verifyToken;
import {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  approveMember,
  getPendingMembers,
  rejectMember,
  updatePrivacy,
  restrictMember,
  kickMember,
  unrestrictMember,
  getUserCommunities,
  getUserCreatedCommunities,
  getUserPublicCommunities,
  isUserMemberOfCommunity,
  updateCommunity,
  deleteCommunity,
  toggleApproval,
  togglePostApproval,
  getRestrictedUsersForCommunities,


  adminGetCommunities,
  adminDeleteCommunity,
  adminUpdateCommunity,
  getRecentCommunities,
  toggleNotification,

  addModerator,
  removeModerator,
  getManagedCommunities,
  getModeratorLogs,

  getCommunityStats,
  logVisit,
  getTopCommunities,
  inviteUser,
} from "../controllers/communityController.js";
import { validateCreateCommunity, validateUpdateCommunity } from "../validators/communityValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { uploadCommunityAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- Admin ---
router.get("/admin/all", verifyToken, isAdmin, adminGetCommunities);
router.put("/admin/:id", verifyToken, isAdmin, adminUpdateCommunity);
router.delete("/admin/:id", verifyToken, isAdmin, adminDeleteCommunity);

// --- User Communities ---
router.get("/my-created", verifyToken, getUserCreatedCommunities); // Cộng đồng đã tạo
router.get("/managed", verifyToken, getManagedCommunities); // Cộng đồng đang quản lý (Mod/Creator)
router.get("/getUser", verifyToken, getUserCommunities); // Cộng đồng đã tham gia (Private)
router.get("/user/:userId", verifyTokenOptional, getUserPublicCommunities); // Cộng đồng đã tham gia (Public)

// --- Insights & Info ---
router.get("/recent/history", verifyToken, getRecentCommunities); // Cộng đồng truy cập gần đây
router.get("/:communityId/pending", verifyToken, getPendingMembers); // Member chờ duyệt
router.get("/restricted-users", verifyToken, getRestrictedUsersForCommunities); // Member bị cấm

// Kiểm tra member
router.get("/:id/is-member", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { id } = req.params;

    if (!token)
      return res.status(401).json({ message: "Access token missing" });

    const isMember = await isUserMemberOfCommunity(token, id);
    res.json({ isMember });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- Actions ---
router.post("/", verifyToken, validateCreateCommunity, validateRequest, createCommunity); // Tạo cộng đồng

router.post("/:id/join", verifyToken, joinCommunity); // Tham gia
router.post("/:id/leave", verifyToken, leaveCommunity); // Rời cộng đồng
router.post("/:id/invite", verifyToken, inviteUser); // Mời thành viên
router.post("/:id/notification", verifyToken, toggleNotification); // Bật/tắt thông báo

// --- Moderation (Quản lý thành viên) ---
router.post("/:communityId/approve/:memberId", verifyToken, approveMember); // Duyệt thành viên
router.post("/:communityId/reject/:memberId", verifyToken, rejectMember); // Từ chối
router.delete("/:id", verifyToken, deleteCommunity);
router.post("/:communityId/restrict/:memberId", verifyToken, restrictMember); // Cấm thành viên (Mute)
router.delete("/:communityId/kick/:memberId", verifyToken, kickMember); // Kick
router.delete("/:communityId/unrestrict/:memberId", verifyToken, unrestrictMember); // Bỏ cấm

// Quản lý Moderator
router.post("/:communityId/moderators/:memberId", verifyToken, addModerator);
router.delete("/:communityId/moderators/:memberId", verifyToken, removeModerator);

// --- Settings ---
router.put("/:id", verifyToken, uploadCommunityAvatar.single("avatar"), validateUpdateCommunity, validateRequest, updateCommunity);
router.put("/:id/privacy", verifyToken, updatePrivacy);
router.put("/:communityId/approval", verifyToken, toggleApproval); // Bật/tắt duyệt thành viên
router.put("/:communityId/post-approval", verifyToken, togglePostApproval); // Bật/tắt duyệt bài viết

// --- Public/General ---
router.get("/top", getTopCommunities);
router.get("/", getCommunities);
router.get("/:id", verifyTokenOptional, getCommunityById);

router.get("/:id/moderator-logs", verifyToken, getModeratorLogs);
router.get("/:id/stats", verifyToken, getCommunityStats);
router.post("/:id/visit", logVisit);

export default router;
