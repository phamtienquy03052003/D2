import express from "express";
import { verifyToken, isAdmin  } from "../middleware/authMiddleware.js";
import { createCommunity, getCommunities, getCommunityById, joinCommunity, leaveCommunity, getUserCommunities, isUserMemberOfCommunity, updateCommunity, deleteCommunity } from "../controllers/communityController.js";

const router = express.Router();

router.put("/:id", verifyToken, isAdmin, updateCommunity);
router.delete("/:id", verifyToken, isAdmin, deleteCommunity);

router.get("/:id/is-member", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const isMember = await isUserMemberOfCommunity(token, id);
    res.json({ isMember });
  } catch (error) {
    console.error("Error checking membership:", error);
    res.status(500).json({ message: "Server error while checking membership" });
  }
});


router.get("/getUser", verifyToken, getUserCommunities);
router.get("/", getCommunities);
router.get("/:id", getCommunityById);
router.post("/", verifyToken, createCommunity);
router.post("/:id/join", verifyToken, joinCommunity);
router.post("/:id/leave", verifyToken, leaveCommunity);

export default router;
