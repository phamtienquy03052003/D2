import Community from "../models/Community.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import ModeratorLog from "../models/ModeratorLog.js";
import slugify from "slugify";

import Notification from "../models/Notification.js";
import CommunityDailyStat from "../models/CommunityDailyStat.js";


/**
 * Mời người dùng vào cộng đồng
 * - Chỉ thành viên mới được mời.
 * - Tạo thông báo (Notification) cho người được mời.
 */
export const inviteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const inviterId = req.user.id;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });



    const isMember = community.members.some(m => m.toString() === inviterId) || community.creator.toString() === inviterId;
    if (!isMember) {
      return res.status(403).json({ message: "Bạn phải là thành viên để mời người khác" });
    }


    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (community.members.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: "Người dùng đã là thành viên" });
    }





    const notification = new Notification({
      user: userId,
      sender: inviterId,
      type: "community_invite",
      community: community._id,
      message: `${req.user.name || "Một thành viên"} đã mời bạn tham gia cộng đồng ${community.name}`,
    });
    await notification.save();


    const io = req.app.get("socketio");
    if (io) {
      io.to(userId).emit("newNotification", notification);
    }

    res.json({ message: "Đã gửi lời mời thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Tạo cộng đồng mới
 * - Kiểm tra giới hạn số lượng cộng đồng được tạo dựa trên Level của user.
 * - Tạo slug từ tên.
 */
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Community.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Tên cộng đồng đã tồn tại" });


    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const createdCount = await Community.countDocuments({
      creator: req.user.id,
      status: "active",
    });

    const maxCommunities = (user.level || 0) + 1;

    if (createdCount >= maxCommunities) {
      return res.status(400).json({
        message: `Bạn chỉ được tạo tối đa ${maxCommunities} cộng đồng (Cấp ${user.level || 0}). Hãy nâng cấp để tạo thêm!`,
      });
    }


    let slug = slugify(name, { lower: true, strict: true });

    const existingSlug = await Community.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${nanoid(6)}`;
    }

    const community = new Community({
      name,
      slug,
      description,
      avatar: "",
      creator: req.user.id,
      members: [req.user.id],
    });

    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách cộng đồng mà user đã tham gia
 */
export const getUserCommunities = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const communities = await Community.find({ members: userId, status: "active" })
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách cộng đồng do user tạo (Làm chủ)
 */
export const getUserCreatedCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ creator: req.user.id, status: "active" })
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách cộng đồng hiển thị trên trang cá nhân user
 * - Nếu xem của chính mình -> Hiện hết.
 * - Nếu xem của người khác -> Chỉ hiện các cộng đồng Public hoặc cả 2 cùng tham gia.
 */
export const getUserPublicCommunities = async (req, res) => {
  try {
    let { userId } = req.params;


    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      const targetUser = await User.findOne({ slug: userId });
      if (!targetUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      userId = targetUser._id.toString();
    }

    const currentUserId = req.user ? req.user.id : null;
    const isOwner = currentUserId && currentUserId === userId;

    const query = {
      members: userId,
      status: "active"
    };

    if (!isOwner) {
      query.isPrivate = false;
    }

    const communities = await Community.find(query)
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    const result = communities.map(community => {
      const isMember = currentUserId
        ? community.members.some(id => id.toString() === currentUserId)
        : false;

      const isPending = currentUserId
        ? community.pendingMembers?.some(id => id.toString() === currentUserId)
        : false;

      return {
        ...community,
        isMember,
        isPending,
        membersCount: community.members.length
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * Lấy danh sách tất cả cộng đồng Public (Gợi ý khám phá)
 */
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: "active", isPrivate: false })
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách Top cộng đồng (đông thành viên nhất)
 */
export const getTopCommunities = async (req, res) => {
  try {
    const communities = await Community.aggregate([
      { $match: { status: "active", isPrivate: false } },
      {
        $addFields: {
          membersCount: { $size: "$members" }
        }
      },
      { $sort: { membersCount: -1 } },
      { $limit: 10 },










    ]);

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Helper: Kiểm tra user có phải thành viên của cộng đồng không (Dùng token)
 */
export const isUserMemberOfCommunity = async (token, communityId) => {
  try {
    if (!token) return false;

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) return false;

    const userId = decoded.id;
    const community = await Community.findById(communityId);

    if (!community) return false;

    return community.members.some((member) => member.toString() === userId);
  } catch (error) {
    console.error("Error checking member status:", error);
    return false;
  }
};


/**
 * Lấy chi tiết cộng đồng theo ID hoặc Slug
 * - Cập nhật danh sách "Cộng đồng truy cập gần đây" (Recent Communities) cho user.
 */
export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const community = await Community.findOne(query)
      .populate({
        path: "creator",
        select: "name email avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate({
        path: "members",
        select: "name email avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate({
        path: "moderators",
        select: "name email avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      });

    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });


    if (req.user && req.user.id) {
      const userId = req.user.id;
      const communityId = community._id;


      await User.findByIdAndUpdate(userId, {
        $pull: { recentCommunities: communityId },
      });


      await User.findByIdAndUpdate(userId, {
        $push: {
          recentCommunities: {
            $each: [communityId],
            $position: 0,
            $slice: 10,
          },
        },
      });
    }


    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Tham gia cộng đồng
 * - Nếu cộng đồng yêu cầu duyệt -> Thêm vào pendingMembers.
 * - Nếu không -> Thêm thẳng vào members.
 */
export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const userId = req.user.id;


    if (community.creator.toString() === userId)
      return res.status(400).json({ message: "Creator luôn là thành viên" });


    if (community.members.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Bạn đã ở trong cộng đồng này" });

    if (community.pendingMembers.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Bạn đã gửi yêu cầu tham gia" });

    if (!community.isApproval) {
      community.members.push(userId);
      await community.save();


      await updateDailyStat(community._id, "newMembers", 1);

      return res.json({ message: "Tham gia thành công", community });
    }

    community.pendingMembers.push(userId);
    await community.save();

    res.json({ message: "Yêu cầu tham gia đã được gửi", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDailyStat = async (communityId, field, value = 1) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await CommunityDailyStat.findOneAndUpdate(
      { community: communityId, date: today },
      { $inc: { [field]: value } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`Failed to update daily stat ${field} for community ${communityId}:`, err);
  }
};


/**
 * Rời cộng đồng
 * - Creator không thể rời (trừ khi chuyển quyền hoặc xóa cộng đồng).
 */
export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const userId = req.user.id;


    if (community.creator.toString() === userId)
      return res.status(400).json({ message: "Creator không thể rời cộng đồng" });

    if (community.pendingMembers.some(id => id.toString() === userId)) {
      community.pendingMembers.pull(userId);
      await community.save();
      return res.json({ message: "Đã hủy yêu cầu tham gia" });
    }

    if (!community.members.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Bạn không phải thành viên" });

    community.members.pull(userId);
    await community.save();

    res.json({ message: "Rời cộng đồng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách thành viên đang chờ duyệt (Pending)
 * - Chỉ dành cho Admin/Mod của cộng đồng.
 */
export const getPendingMembers = async (req, res) => {
  try {
    const { communityId } = req.params;

    const { communityId: id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query)
      .populate({
        path: "pendingMembers",
        select: "name email avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate({
        path: "creator",
        select: "name email avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      });

    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const isCreator = community.creator._id.toString() === req.user.id;
    const isMod = community.moderators.some((m) => m.toString() === req.user.id);

    if (!isCreator && !isMod)
      return res.status(403).json({ message: "Bạn không có quyền xem danh sách chờ" });

    res.json({ pendingMembers: community.pendingMembers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Bật/Tắt chế độ duyệt thành viên
 */
export const toggleApproval = async (req, res) => {
  try {
    const { communityId } = req.params;



    const { communityId: id } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });


    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền thay đổi xét duyệt" });


    community.isApproval = !community.isApproval;

    await community.save();

    res.json({
      message: community.isApproval
        ? "Đã bật chế độ xét duyệt"
        : "Đã tắt chế độ xét duyệt",
      isApproval: community.isApproval,
      community,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Bật/Tắt chế độ duyệt bài viết
 */
export const togglePostApproval = async (req, res) => {
  try {
    const { communityId } = req.params;



    const { communityId: id } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền thay đổi xét duyệt bài viết" });

    community.postApprovalRequired = !community.postApprovalRequired;
    await community.save();

    res.json({
      message: community.postApprovalRequired
        ? "Đã bật xét duyệt bài viết"
        : "Đã tắt xét duyệt bài viết",
      postApprovalRequired: community.postApprovalRequired,
      community,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Duyệt thành viên vào nhóm
 * - Ghi log ModeratorLog.
 */
export const approveMember = async (req, res) => {
  try {
    const { communityId: id, memberId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const isCreator = community.creator.toString() === req.user.id;
    const isMod = community.moderators.some((m) => m.toString() === req.user.id);

    if (!isCreator && !isMod)
      return res.status(403).json({ message: "Bạn không có quyền duyệt" });


    if (!community.pendingMembers.some(id => id.toString() === memberId))
      return res.status(400).json({ message: "Không nằm trong danh sách chờ" });

    community.pendingMembers.pull(memberId);
    community.members.push(memberId);

    await community.save();


    await ModeratorLog.create({
      actor: req.user.id,
      action: "approve_member",
      target: memberId,
      targetModel: "User",
      community: communityId,
    });


    await updateDailyStat(communityId, "newMembers", 1);

    res.json({ message: "Đã duyệt thành viên", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Từ chối yêu cầu tham gia
 */
export const rejectMember = async (req, res) => {
  try {
    const { communityId: id, memberId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const isCreator = community.creator.toString() === req.user.id;
    const isMod = community.moderators.some((m) => m.toString() === req.user.id);

    if (!isCreator && !isMod)
      return res.status(403).json({ message: "Bạn không có quyền từ chối" });

    if (!community.pendingMembers.some(id => id.toString() === memberId))
      return res.status(400).json({ message: "Không nằm trong danh sách chờ" });

    community.pendingMembers.pull(memberId);
    await community.save();


    await ModeratorLog.create({
      actor: req.user.id,
      action: "reject_member",
      target: memberId,
      targetModel: "User",
      community: communityId,
    });

    res.json({ message: "Đã từ chối thành viên", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Cập nhật thông tin cộng đồng (Tên, Mô tả, Avatar)
 */
export const updateCommunity = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const { id } = req.params;

    let query = { status: "active" };
    if (mongoose.Types.ObjectId.isValid(id)) query._id = id;
    else query.slug = id;

    if (name) {
      updateData.name = name;


      let slug = slugify(name, { lower: true, strict: true });

      const existingSlug = await Community.findOne({ slug, _id: { $ne: updated?._id || query._id || query.slug } });








      let excludeQuery = {};
      if (mongoose.Types.ObjectId.isValid(id)) {
        excludeQuery = { _id: { $ne: id } };
      } else {



      }
    }


    const communityToUpdate = await Community.findOne(query);
    if (!communityToUpdate) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (communityToUpdate.status === "removed") return res.status(410).json({ message: "Cộng đồng đã bị xóa" });



















    if (name) {
      updateData.name = name;
      let slug = slugify(name, { lower: true, strict: true });
      const existingSlug = await Community.findOne({ slug, _id: { $ne: communityToUpdate._id } });
      if (existingSlug) {
        slug = `${slug}-${nanoid(6)}`;
      }
      updateData.slug = slug;
    }
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      updateData.avatar = `/uploads/communityAvatars/${req.file.filename}`;
    }

    const updated = await Community.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    ).populate("creator", "name email avatar");

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Cập nhật quyền riêng tư (Public/Private)
 */
export const updatePrivacy = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const { isPrivate } = req.body;

    if (typeof isPrivate !== "boolean")
      return res.status(400).json({ message: "isPrivate phải là true/false" });

    let query = {};
    if (mongoose.Types.ObjectId.isValid(communityId)) query = { _id: communityId };
    else query = { slug: communityId };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền đổi trạng thái" });

    community.isPrivate = isPrivate;
    await community.save();

    res.json({ message: "Cập nhật thành công", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Hạn chế (Mute) thành viên trong thời gian nhất định
 * - Không cho phép đăng bài/comment.
 */
/**
 * Hạn chế (Mute) thành viên trong thời gian nhất định
 * - Không cho phép đăng bài/comment.
 */
export const restrictMember = async (req, res) => {
  try {
    const { communityId: id, memberId } = req.params;
    const { duration } = req.body;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    }

    const isCreator = community.creator.toString() === req.user.id;
    const isMod = community.moderators.includes(req.user.id);

    if (!isCreator && !isMod) {
      return res.status(403).json({
        message: "Bạn không có quyền hạn chế thành viên",
      });
    }

    if (memberId === community.creator.toString()) {
      return res.status(400).json({
        message: "Không thể hạn chế người tạo cộng đồng",
      });
    }


    if (isMod && community.moderators.includes(memberId)) {
      return res.status(403).json({
        message: "Kiểm duyệt viên không thể hạn chế kiểm duyệt viên khác",
      });
    }


    let expiresAt = new Date();
    switch (duration) {
      case "24h":
        expiresAt.setHours(expiresAt.getHours() + 24);
        break;
      case "7d":
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case "1m":
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
      case "1y":
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ message: "Thời gian hạn chế không hợp lệ" });
    }


    const existingIndex = community.restrictedUsers.findIndex(
      (r) => r.user.toString() === memberId
    );

    if (existingIndex !== -1) {

      community.restrictedUsers[existingIndex].restrictedAt = new Date();
      community.restrictedUsers[existingIndex].expiresAt = expiresAt;
    } else {

      community.restrictedUsers.push({
        user: memberId,
        restrictedAt: new Date(),
        expiresAt: expiresAt,
      });
    }

    await community.save();

    return res.status(200).json({
      message: `Đã hạn chế người dùng trong ${duration}`,
      community,
    });
  } catch (error) {
    console.error("Lỗi khi hạn chế thành viên:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi hạn chế thành viên" });
  }
};


/**
 * Xóa thành viên khỏi cộng đồng (Kick)
 * - Chỉ Creator mới có tin nhắn xóa thành viên.
 */
export const kickMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    }

    if (community.creator.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Chỉ người tạo cộng đồng mới có quyền xóa thành viên",
      });
    }

    if (memberId === community.creator.toString()) {
      return res.status(400).json({
        message: "Không thể xóa người tạo cộng đồng",
      });
    }


    community.members = community.members.filter(
      (id) => id.toString() !== memberId
    );

    await community.save();

    return res.status(200).json({
      message: "Đã xóa thành viên khỏi cộng đồng",
      community,
    });
  } catch (error) {
    console.error("Lỗi khi xóa thành viên:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi xóa thành viên" });
  }
};


/**
 * Gỡ bỏ hạn chế (Unmute) cho thành viên
 */
export const unrestrictMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    }

    const isCreator = community.creator.toString() === req.user.id;
    const isMod = community.moderators.includes(req.user.id);

    if (!isCreator && !isMod) {
      return res.status(403).json({
        message: "Bạn không có quyền gỡ bỏ hạn chế",
      });
    }


    community.restrictedUsers = community.restrictedUsers.filter(
      (r) => r.user.toString() !== memberId
    );

    await community.save();

    return res.status(200).json({
      message: "Đã gỡ bỏ hạn chế cho thành viên",
      community,
    });
  } catch (error) {
    console.error("Lỗi khi gỡ bỏ hạn chế:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi gỡ bỏ hạn chế" });
  }
};


/**
 * Lấy danh sách thành viên bị hạn chế trong các cộng đồng quản lý
 */
export const getRestrictedUsersForCommunities = async (req, res) => {
  try {
    const communitiesParam = req.query.communities || "";

    const requestedIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const ownedCommunities = await Community.find({
      creator: req.user.id,
      status: "active",
    }).select("_id name restrictedUsers");

    if (!ownedCommunities.length) return res.json([]);

    const ownedIds = ownedCommunities.map((c) => c._id.toString());

    const allowedIds =
      requestedIds.length > 0
        ? requestedIds.filter((id) => ownedIds.includes(id))
        : ownedIds;

    if (!allowedIds.length) return res.json([]);

    const communities = await Community.find({
      _id: { $in: allowedIds },
    })
      .select("name restrictedUsers")
      .populate({
        path: "restrictedUsers.user",
        select: "name email avatar role selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      });

    const result = communities.map((c) => {


      const activeRestrictedUsers = c.restrictedUsers.map(r => ({
        _id: r.user._id,
        name: r.user.name,
        email: r.user.email,
        avatar: r.user.avatar,
        selectedNameTag: r.user.selectedNameTag,
        role: r.user.role,
        restrictedAt: r.restrictedAt,
        expiresAt: r.expiresAt
      }));

      return {
        communityId: c._id,
        communityName: c.name,
        restrictedUsers: activeRestrictedUsers,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Lỗi getRestrictedUsersForCommunities:", err);
    res.status(500).json({ message: err.message });
  }
};



/**
 * Xóa cộng đồng (Chủ sở hữu thực hiện)
 * - Xóa tất cả bài viết, comment liên quan.
 * - Xóa vĩnh viễn (Hard delete).
 */
export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;


    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const communityId = community._id;


    const posts = await Post.find({ community: communityId });
    const postIds = posts.map(p => p._id);


    await Comment.deleteMany({ post: { $in: postIds } });


    await Post.deleteMany({ community: communityId });


    const deletedCommunity = await Community.findByIdAndDelete(communityId);

    if (!deletedCommunity) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    }


    if (deletedCommunity.avatar) {
      const relativePath = deletedCommunity.avatar.startsWith("/")
        ? deletedCommunity.avatar.slice(1)
        : deletedCommunity.avatar;
      const avatarPath = path.join(process.cwd(), "src/assets", relativePath);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }



    await ModeratorLog.create({
      actor: req.user.id,
      action: "delete_community",
      target: id,
      targetModel: "Community",
      community: null,
      details: "Community and all its content permanently deleted"
    });

    res.status(200).json({ success: true, message: "Đã xóa vĩnh viễn cộng đồng và toàn bộ nội dung liên quan." });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa cộng đồng." });
  }
};


/**
 * Admin lấy danh sách tất cả cộng đồng
 */
export const adminGetCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: "active" })
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteAvatarFile = (avatarPathRaw) => {
  if (!avatarPathRaw) return;

  const relativePath = avatarPathRaw.startsWith("/")
    ? avatarPathRaw.slice(1)
    : avatarPathRaw;

  const avatarPath = path.join(process.cwd(), "src/assets", relativePath);

  if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
};

/**
 * Admin xóa cộng đồng
 * - Xóa tất cả dữ liệu liên quan.
 * - Ghi log Admin.
 */
export const adminDeleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });


    const posts = await Post.find({ community: id });
    const postIds = posts.map((p) => p._id);


    if (postIds.length > 0) {
      await Comment.deleteMany({ post: { $in: postIds } });
      await Post.deleteMany({ _id: { $in: postIds } });
    }


    deleteAvatarFile(community.avatar);


    await Community.findByIdAndDelete(id);


    await ModeratorLog.create({
      actor: req.user.id,
      action: "delete_community_admin",
      target: id,
      targetModel: "Community",
      community: null,
      details: "Admin permanently deleted community and all content",
    });

    res.json({ message: "Admin đã xóa vĩnh viễn cộng đồng và nội dung liên quan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Admin cập nhật thông tin cộng đồng
 */
export const adminUpdateCommunity = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const { id } = req.params;

    const updateFields = { name, description };

    if (avatar === "") {
      const old = await Community.findById(id).select("avatar");
      if (old?.avatar) deleteAvatarFile(old.avatar);

      updateFields.avatar = "";
    }

    const updated = await Community.findOneAndUpdate(
      { _id: id, status: "active" },
      updateFields,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Thêm kiểm duyệt viên (Moderator)
 * - Chỉ Creator mới có quyền này.
 */
export const addModerator = async (req, res) => {
  try {
    const { communityId: id, memberId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Chỉ chủ cộng đồng mới có quyền thêm kiểm duyệt viên" });

    if (!community.members.includes(memberId))
      return res.status(400).json({ message: "Người dùng không phải là thành viên" });

    if (community.moderators.includes(memberId))
      return res.status(400).json({ message: "Người dùng đã là kiểm duyệt viên" });

    community.moderators.push(memberId);
    await community.save();


    await ModeratorLog.create({
      actor: req.user.id,
      action: "add_moderator",
      target: memberId,
      targetModel: "User",
      community: communityId,
    });

    res.json({ message: "Đã thêm kiểm duyệt viên", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Xóa kiểm duyệt viên (Moderator)
 */
export const removeModerator = async (req, res) => {
  try {
    const { communityId: id, memberId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Chỉ chủ cộng đồng mới có quyền xóa kiểm duyệt viên" });

    community.moderators = community.moderators.filter(id => id.toString() !== memberId);
    await community.save();


    await ModeratorLog.create({
      actor: req.user.id,
      action: "remove_moderator",
      target: memberId,
      targetModel: "User",
      community: communityId,
    });

    res.json({ message: "Đã xóa quyền kiểm duyệt viên", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách cộng đồng mà user đang quản lý (Creator hoặc Mod)
 */
export const getManagedCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const communities = await Community.find({
      $or: [
        { creator: userId },
        { moderators: userId }
      ],
      status: "active"
    })
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy danh sách cộng đồng truy cập gần đây
 */
export const getRecentCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "recentCommunities",
      select: "name avatar description members slug",
    });

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });


    const activeRecentCommunities = user.recentCommunities.filter(
      (c) => c && c.status !== "removed"
    );

    res.json(activeRecentCommunities);
  } catch (err) {
    console.error("Lỗi getRecentCommunities:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Bật/Tắt nhận thông báo từ cộng đồng
 */
export const toggleNotification = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user.id;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(communityId)) query = { _id: communityId };
    else query = { slug: communityId };

    const community = await Community.findOne(query);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });


    const isMember = community.members.some((id) => id.toString() === userId);
    const isCreator = community.creator.toString() === userId;

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: "Bạn phải là thành viên mới được bật thông báo" });
    }

    const isSubscribed = community.notificationSubscribers.some(
      (id) => id.toString() === userId
    );

    if (isSubscribed) {
      community.notificationSubscribers.pull(userId);
    } else {
      community.notificationSubscribers.push(userId);
    }

    await community.save();

    res.json({
      message: isSubscribed ? "Đã tắt thông báo" : "Đã bật thông báo",
      isSubscribed: !isSubscribed,
    });
  } catch (err) {
    console.error("Lỗi toggleNotification:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Xem nhật ký hoạt động Moderator (Moderator Logs)
 */
export const getModeratorLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, page = 1 } = req.query;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };


    const community = await Community.findOne(query);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const isOwner = community.creator.toString() === req.user.id;
    const isMod = community.moderators.includes(req.user.id);

    if (!isOwner && !isMod) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await ModeratorLog.find({ community: id })
      .populate("actor", "name avatar email")
      .populate("target")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Thống kê số liệu cộng đồng (Members, Posts, Comments, Visitors)
 * - Hỗ trợ lọc theo thời gian (24h, 7d, 30d, 1y).
 */
export const getCommunityStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange } = req.query;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }


    const isCreator = community.creator.toString() === req.user.id;
    const isMod = community.moderators.some((m) => m.toString() === req.user.id);
    if (!isCreator && !isMod) {
      return res.status(403).json({ message: "Unauthorized" });
    }


    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        previousStartDate.setHours(now.getHours() - 48);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case "12m":
        startDate.setMonth(now.getMonth() - 12);
        previousStartDate.setMonth(now.getMonth() - 24);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
    }


    const totalMembers = community.members.length;
    const memberChange = 0;


    const totalPosts = await Post.countDocuments({ community: id, status: "active" });
    const postsInPeriod = await Post.countDocuments({
      community: id,
      status: "active",
      createdAt: { $gte: startDate }
    });
    const postsInPreviousPeriod = await Post.countDocuments({
      community: id,
      status: "active",
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const postChange = postsInPeriod - postsInPreviousPeriod;


    const commentsAggregation = await Post.aggregate([
      { $match: { community: new mongoose.Types.ObjectId(id), status: "active" } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "postComments"
        }
      },
      { $unwind: "$postComments" },
      { $replaceRoot: { newRoot: "$postComments" } },
      { $match: { status: "active" } },
      {
        $facet: {
          total: [{ $count: "count" }],
          currentPeriod: [
            { $match: { createdAt: { $gte: startDate } } },
            { $count: "count" }
          ],
          previousPeriod: [
            { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const totalComments = commentsAggregation[0].total[0]?.count || 0;
    const commentsInPeriod = commentsAggregation[0].currentPeriod[0]?.count || 0;
    const commentsInPreviousPeriod = commentsAggregation[0].previousPeriod[0]?.count || 0;
    const commentChange = commentsInPeriod - commentsInPreviousPeriod;


    const totalViews = 0;
    const viewChange = 0;


    let dateFormat = "%Y-%m-%d";
    if (timeRange === "24h") dateFormat = "%Y-%m-%d %H:00";
    if (timeRange === "12m") dateFormat = "%Y-%m";

    const chartAggregation = await Post.aggregate([
      {
        $match: {
          community: new mongoose.Types.ObjectId(id),
          status: "active",
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "+07:00" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const postChartData = chartAggregation.map(item => ({
      date: item._id,
      value: item.count
    }));


    const dailyStats = await CommunityDailyStat.find({
      community: id,
      date: { $gte: startDate.toISOString().slice(0, 10) }
    }).sort({ date: 1 });

    const memberChartData = dailyStats.map(stat => ({
      date: stat.date,
      value: stat.newMembers
    }));

    const visitorChartData = dailyStats.map(stat => ({
      date: stat.date,
      value: stat.uniqueVisitors
    }));


    const totalUniqueVisitors = dailyStats.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);


    const previousDailyStats = await CommunityDailyStat.find({
      community: id,
      date: {
        $gte: previousStartDate.toISOString().slice(0, 10),
        $lt: startDate.toISOString().slice(0, 10)
      }
    });
    const previousUniqueVisitors = previousDailyStats.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);
    const uniqueVisitorChange = totalUniqueVisitors - previousUniqueVisitors;


    res.json({
      stats: {
        views: { total: totalViews, change: viewChange, isIncrease: viewChange >= 0 },
        members: { total: totalMembers, change: memberChange, isIncrease: memberChange >= 0 },
        posts: { total: postsInPeriod, change: postChange, isIncrease: postChange >= 0 },
        comments: { total: commentsInPeriod, change: commentChange, isIncrease: commentChange >= 0 },
        uniqueVisitors: { total: totalUniqueVisitors, change: uniqueVisitorChange, isIncrease: uniqueVisitorChange >= 0 }
      },
      chartData: postChartData,
      charts: {
        posts: postChartData,
        members: memberChartData,
        uniqueVisitors: visitorChartData
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Ghi nhận lượt truy cập vào cộng đồng (Log visit)
 * - Cập nhật thống kê `uniqueVisitors` theo ngày.
 */
export const logVisit = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const community = await Community.findOne(query);
    if (!community) return res.status(404).json({ message: "Community not found" });


    const communityId = community._id;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const today = new Date().toISOString().slice(0, 10);




    const stat = await CommunityDailyStat.findOneAndUpdate(
      { community: communityId, date: today },
      {
        $inc: { views: 1 },
        $addToSet: { visitedIps: ip }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );







    await CommunityDailyStat.updateOne(
      { community: communityId, date: today },
      [{
        $set: {
          uniqueVisitors: { $size: "$visitedIps" }
        }
      }]
    );

    res.status(200).json({ message: "Visit logged" });
  } catch (err) {
    console.error("Log Visit Error:", err);
    res.status(500).json({ message: err.message });
  }
};
