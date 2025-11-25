import express from "express";
import { verifyToken, isAdmin, verifyTokenOptional } from "../middleware/authMiddleware.js";
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
  getUserCommunities,
  getUserCreatedCommunities,
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
} from "../controllers/communityController.js";

const router = express.Router();

/*---------------- ADMIN ----------------*/
router.get("/admin/all", verifyToken, isAdmin, adminGetCommunities);
router.put("/admin/:id", verifyToken, isAdmin, adminUpdateCommunity);
router.delete("/admin/:id", verifyToken, isAdmin, adminDeleteCommunity);

/*---------------- USER COMMUNITIES ----------------*/
router.get("/my-created", verifyToken, getUserCreatedCommunities);
router.get("/getUser", verifyToken, getUserCommunities);

/*---------------- PENDING ----------------*/
router.get("/recent/history", verifyToken, getRecentCommunities);
router.get("/:communityId/pending", verifyToken, getPendingMembers);
router.get("/restricted-users", verifyToken, getRestrictedUsersForCommunities);

/*---------------- CHECK MEMBER ----------------*/
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

/*---------------- CRUD COMMUNITY ----------------*/
router.post("/", verifyToken, createCommunity);

router.post("/:id/join", verifyToken, joinCommunity);
router.post("/:id/leave", verifyToken, leaveCommunity);
router.post("/:id/notification", verifyToken, toggleNotification);

router.post("/:communityId/approve/:memberId", verifyToken, approveMember);
router.post("/:communityId/reject/:memberId", verifyToken, rejectMember);

router.delete("/:id", verifyToken, deleteCommunity);
router.delete("/:communityId/restrict/:memberId", verifyToken, restrictMember);

router.put("/:id", verifyToken, updateCommunity);
router.put("/:id/privacy", verifyToken, updatePrivacy);
router.put("/:communityId/approval", verifyToken, toggleApproval);
router.put("/:communityId/post-approval", verifyToken, togglePostApproval);

/*---------------- COMMON ----------------*/
router.get("/", getCommunities);
router.get("/:id", verifyTokenOptional, getCommunityById);

export default router;
