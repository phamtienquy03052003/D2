import Community from "../models/Community.js";

/**
 * Middleware kiểm tra quyền Moderator của Community
 * - Chỉ cho phép Owner hoặc Mod của cộng đồng thực hiện hành động.
 */
export const isCommunityMod = async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user.id;

  const community = await Community.findById(communityId);

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  const isMod =
    community.owner.toString() === userId ||
    community.moderators.includes(userId);

  if (!isMod) {
    return res.status(403).json({ message: "You are not moderator of this community" });
  }

  next();
};
