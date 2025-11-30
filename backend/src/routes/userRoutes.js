import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
  updatePassword,
  getUserPublic,
  updatePrivacy,
  searchUsers,
  updatePhone,
  updateGender,
  updateChatRequestPermission,
  blockUser,
  unblockUser,
  getBlockedUsers,
  followUser,
  unfollowUser,
  toggleFollowNotification,
  getFollowStatus,
  getXPHistory,
  getMyFollowers,
  updateNameTag,
} from "../controllers/userController.js";
import { verifyToken, isAdmin, verifyTokenOptional } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy thông tin user hiện tại
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateProfile);
router.put("/me/privacy", verifyToken, updatePrivacy);
router.put("/me/password", verifyToken, updatePassword);
router.put("/me/phone", verifyToken, updatePhone);
router.put("/me/gender", verifyToken, updateGender);
router.put("/me/chat-request-permission", verifyToken, updateChatRequestPermission);
router.put("/me/nametag", verifyToken, updateNameTag);
router.get("/search", verifyToken, searchUsers);

// Chặn người dùng
router.post("/me/block", verifyToken, blockUser);
router.post("/me/unblock", verifyToken, unblockUser);
router.get("/me/blocked", verifyToken, getBlockedUsers);
router.get("/me/xp-history", verifyToken, getXPHistory);

// Follow
router.get("/me/followers", verifyToken, getMyFollowers);
router.post("/me/follow", verifyToken, followUser);
router.post("/me/unfollow", verifyToken, unfollowUser);
router.post("/me/follow/notification", verifyToken, toggleFollowNotification);
router.get("/me/follow/:followingId", verifyToken, getFollowStatus);

// Lấy thông tin user public
router.get("/public/:id", verifyTokenOptional, getUserPublic);

// Quản lý người dùng (Admin)
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
