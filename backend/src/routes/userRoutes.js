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


router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateProfileValidator, validateRequest, updateProfile);
router.put("/me/privacy", verifyToken, updatePrivacy);
router.put("/me/password", verifyToken, updatePasswordValidator, validateRequest, updatePassword);
router.put("/me/phone", verifyToken, updatePhoneValidator, validateRequest, updatePhone);
router.put("/me/gender", verifyToken, updateGenderValidator, validateRequest, updateGender);
router.put("/me/chat-request-permission", verifyToken, updateChatRequestPermission);
router.put("/me/nametag", verifyToken, updateNameTag);

router.get("/search", verifyToken, searchUsers);


router.post("/me/block", verifyToken, blockUser);
router.post("/me/unblock", verifyToken, unblockUser);
router.get("/me/blocked", verifyToken, getBlockedUsers);
router.get("/me/xp-history", verifyToken, getXPHistory);


router.get("/me/followers", verifyToken, getMyFollowers);
router.post("/me/follow", verifyToken, followUser);
router.post("/me/unfollow", verifyToken, unfollowUser);
router.post("/me/follow/notification", verifyToken, toggleFollowNotification);
router.get("/me/follow/:followingId", verifyToken, getFollowStatus);


router.get("/public/:id", verifyTokenOptional, getUserPublic);


router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
