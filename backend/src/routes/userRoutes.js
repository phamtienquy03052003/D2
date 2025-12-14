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

import {
  updateProfileValidator,
  updatePasswordValidator,
  updatePhoneValidator,
  updateGenderValidator,

} from "../validators/userValidator.js";
import { verifyToken, isAdmin, verifyTokenOptional } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * Routes người dùng (User)
 */

// --- Cá nhân (Me) ---
router.get("/me", verifyToken, getMe); // Lấy thông tin bản thân
router.put("/me", verifyToken, updateProfileValidator, validateRequest, updateProfile); // Cập nhật hồ sơ
router.put("/me/privacy", verifyToken, updatePrivacy); // Cài đặt riêng tư
router.put("/me/password", verifyToken, updatePasswordValidator, validateRequest, updatePassword); // Đổi mật khẩu
router.put("/me/phone", verifyToken, updatePhoneValidator, validateRequest, updatePhone); // Cập nhật SĐT
router.put("/me/gender", verifyToken, updateGenderValidator, validateRequest, updateGender); // Cập nhật giới tính
router.put("/me/chat-request-permission", verifyToken, updateChatRequestPermission); // Cài đặt quyền nhắn tin
router.put("/me/nametag", verifyToken, updateNameTag); // Thay đổi thẻ tên

router.get("/search", verifyToken, searchUsers); // Tìm kiếm người dùng

// --- Tương tác (Block/Follow) ---
router.post("/me/block", verifyToken, blockUser); // Chặn người dùng
router.post("/me/unblock", verifyToken, unblockUser); // Bỏ chặn
router.get("/me/blocked", verifyToken, getBlockedUsers); // Danh sách chặn
router.get("/me/xp-history", verifyToken, getXPHistory); // Lịch sử nhận XP

// Follow
router.get("/me/followers", verifyToken, getMyFollowers); // Danh sách người theo dõi mình
router.post("/me/follow", verifyToken, followUser); // Theo dõi người khác
router.post("/me/unfollow", verifyToken, unfollowUser); // Bỏ theo dõi
router.post("/me/follow/notification", verifyToken, toggleFollowNotification); // Bật/tắt thông báo từ người follow
router.get("/me/follow/:followingId", verifyToken, getFollowStatus); // Kiểm tra trạng thái follow

// --- Public ---
router.get("/public/:id", verifyTokenOptional, getUserPublic); // Lấy profile công khai

// --- Admin ---
router.get("/", verifyToken, isAdmin, getAllUsers); // Lấy tất cả user (Admin)
router.put("/:id", verifyToken, isAdmin, updateUser); // Cập nhật user (Admin)
router.delete("/:id", verifyToken, isAdmin, deleteUser); // Xóa user (Admin)

export default router;
