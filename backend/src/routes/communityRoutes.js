import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
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
  removeMember,
  getUserCommunities,
  getUserCreatedCommunities,
  isUserMemberOfCommunity,
  updateCommunity,
  deleteCommunity,
  toggleApproval,
  togglePostApproval,
  adminGetCommunities,
  adminDeleteCommunity,
  adminUpdateCommunity,
  // getRemovedContent,
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
router.get("/:communityId/pending", verifyToken, getPendingMembers);

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

router.post("/:communityId/approve/:memberId", verifyToken, approveMember);
router.post("/:communityId/reject/:memberId", verifyToken, rejectMember);
// router.post("/removed-content", verifyToken, getRemovedContent);

router.delete("/:id", verifyToken, deleteCommunity);
router.delete("/:communityId/member/:memberId", verifyToken, removeMember);

router.put("/:id", verifyToken, updateCommunity);
router.put("/:id/privacy", verifyToken, updatePrivacy);
router.put("/:communityId/approval", verifyToken, toggleApproval);
router.put("/:communityId/post-approval", verifyToken, togglePostApproval);

/*---------------- COMMON ----------------*/
router.get("/", getCommunities);
router.get("/:id", getCommunityById);

export default router;
