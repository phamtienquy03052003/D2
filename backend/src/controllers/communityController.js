import Community from "../models/Community.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

/*--------------------------------------------
  TẠO COMMUNITY
---------------------------------------------*/
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Community.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Community name already exists" });

    const community = new Community({
      name,
      description,
      avatar: "",
      creator: req.user.id,
      members: [req.user.id], // Creator luôn là member
    });

    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  LẤY COMMUNITY USER ĐANG THAM GIA
---------------------------------------------*/
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

/*--------------------------------------------
  LẤY COMMUNITY USER ĐÃ TẠO
---------------------------------------------*/
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

/*--------------------------------------------
  KIỂM TRA USER LÀ MEMBER
---------------------------------------------*/
export const isUserMemberOfCommunity = async (accessToken, communityId) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id;

    if (!mongoose.Types.ObjectId.isValid(communityId)) return false;

    const community = await Community.findById(communityId);
    if (!community || community.status !== "active") return false;

    return community.members.some(
      (id) => id.toString() === userId.toString()
    );
  } catch {
    return false;
  }
};

/*--------------------------------------------
  LẤY TẤT CẢ COMMUNITY
---------------------------------------------*/
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: "active" })
      .populate("creator", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  LẤY COMMUNITY THEO ID
---------------------------------------------*/
export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX: validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const community = await Community.findById(id)
      .populate("creator", "name email avatar")
      .populate("members", "name email avatar");

    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    // --- LOGIC MỚI: LƯU LỊCH SỬ XEM CỘNG ĐỒNG ---
    if (req.user && req.user.id) {
      const userId = req.user.id;
      await User.findByIdAndUpdate(userId, {
        $pull: { recentCommunities: community._id },
      });
      await User.findByIdAndUpdate(userId, {
        $push: { recentCommunities: { $each: [community._id], $position: 0, $slice: 5 } },
      });
    }
    // --------------------------------------------

    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  JOIN COMMUNITY (CÓ XÉT DUYỆT)
---------------------------------------------*/
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const userId = req.user.id;

    // FIX: Prevent creator from join again
    if (community.creator.toString() === userId)
      return res.status(400).json({ message: "Creator luôn là thành viên" });

    // FIX: ObjectId compare
    if (community.members.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Bạn đã ở trong cộng đồng này" });

    if (community.pendingMembers.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Bạn đã gửi yêu cầu tham gia" });

    if (!community.isApproval) {
      community.members.push(userId);
      await community.save();
      return res.json({ message: "Tham gia thành công", community });
    }

    community.pendingMembers.push(userId);
    await community.save();

    res.json({ message: "Yêu cầu tham gia đã được gửi", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  LEAVE COMMUNITY
---------------------------------------------*/
export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    const userId = req.user.id;

    // FIX: Creator cannot leave
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

/*--------------------------------------------
  GET PENDING MEMBERS (CREATOR)
---------------------------------------------*/
export const getPendingMembers = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate("pendingMembers", "name email avatar")
      .populate("creator", "name email avatar");

    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    if (community.creator._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền xem danh sách chờ" });

    res.json({ pendingMembers: community.pendingMembers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  TOGGLE APPROVAL (CREATOR)
---------------------------------------------*/
export const toggleApproval = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(communityId))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    // Chỉ creator có quyền bật/tắt xét duyệt
    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền thay đổi xét duyệt" });

    // Toggle
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

/*--------------------------------------------
  TOGGLE POST APPROVAL (CREATOR)
---------------------------------------------*/
export const togglePostApproval = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(communityId))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const community = await Community.findById(communityId);
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

/*--------------------------------------------
  APPROVE MEMBER
---------------------------------------------*/
export const approveMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền duyệt" });

    // FIX: ObjectId compare
    if (!community.pendingMembers.some(id => id.toString() === memberId))
      return res.status(400).json({ message: "Không nằm trong danh sách chờ" });

    community.pendingMembers.pull(memberId);
    community.members.push(memberId);

    await community.save();
    res.json({ message: "Đã duyệt thành viên", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  REJECT MEMBER
---------------------------------------------*/
export const rejectMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    if (community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền từ chối" });

    if (!community.pendingMembers.some(id => id.toString() === memberId))
      return res.status(400).json({ message: "Không nằm trong danh sách chờ" });

    community.pendingMembers.pull(memberId);
    await community.save();

    res.json({ message: "Đã từ chối thành viên", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  UPDATE COMMUNITY
---------------------------------------------*/
export const updateCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const updated = await Community.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { name, description },
      { new: true }
    ).populate("creator", "name email avatar");

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  UPDATE PRIVACY
---------------------------------------------*/
export const updatePrivacy = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const { isPrivate } = req.body;

    if (typeof isPrivate !== "boolean")
      return res.status(400).json({ message: "isPrivate phải là true/false" });

    const community = await Community.findById(communityId);
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

// Hạn chế thành viên (xóa khỏi members và thêm vào restrictedUsers)
export const restrictMember = async (req, res) => {
  try {
    console.log("restrictMember called", req.params, req.user.id);
    const communityId = req.params.communityId;
    const userId = req.params.memberId

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    }

    // Chỉ creator được hạn chế thành viên
    if (community.creator.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Chỉ người tạo cộng đồng mới có quyền hạn chế thành viên",
      });
    }

    // Nếu user đang là creator thì không được restrict
    if (userId === community.creator.toString()) {
      return res.status(400).json({
        message: "Không thể hạn chế người tạo cộng đồng",
      });
    }

    // XÓA user khỏi members[]
    community.members = community.members.filter(
      (id) => id.toString() !== userId
    );

    // THÊM user vào restrictedUsers nếu chưa tồn tại
    if (!community.restrictedUsers.includes(userId)) {
      community.restrictedUsers.push(userId);
    }

    await community.save();

    return res.status(200).json({
      message: "Đã hạn chế người dùng thành công",
      community,
    });
  } catch (error) {
    console.error("Lỗi khi hạn chế thành viên:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi hạn chế thành viên" });
  }
};

// Lấy danh sách người dùng bị hạn chế (restrictedUsers) của 1 hoặc nhiều cộng đồng
export const getRestrictedUsersForCommunities = async (req, res) => {
  try {
    const communitiesParam = req.query.communities || "";

    // Tách list query -> thành array ObjectId hợp lệ
    const requestedIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    // Lấy các community mà user hiện tại là creator
    const ownedCommunities = await Community.find({
      creator: req.user.id,
      status: "active",
    }).select("_id name restrictedUsers");

    if (!ownedCommunities.length) return res.json([]);

    const ownedIds = ownedCommunities.map((c) => c._id.toString());

    // Lọc theo requestedIds nếu có
    const allowedIds =
      requestedIds.length > 0
        ? requestedIds.filter((id) => ownedIds.includes(id))
        : ownedIds;

    if (!allowedIds.length) return res.json([]);

    // Lấy thông tin restrictedUsers của các cộng đồng được phép
    const communities = await Community.find({
      _id: { $in: allowedIds },
    })
      .select("name restrictedUsers")
      .populate("restrictedUsers", "name email avatar role");

    res.json(
      communities.map((c) => ({
        communityId: c._id,
        communityName: c.name,
        restrictedUsers: c.restrictedUsers,
      }))
    );
  } catch (err) {
    console.error("Lỗi getRestrictedUsersForCommunities:", err);
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  DELETE COMMUNITY (CREATOR)
---------------------------------------------*/
export const deleteCommunity = async (req, res) => {
  try {
    const { id: communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    if (community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền xóa" });

    // Xóa avatar nếu có
    if (community.avatar) {
      const relativePath = community.avatar.startsWith("/")
        ? community.avatar.slice(1)
        : community.avatar;

      const avatarPath = path.join(process.cwd(), "src/assets", relativePath);

      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    community.status = "removed";
    await community.save();

    const posts = await Post.find({ community: communityId }, "_id");
    const postIds = posts.map((p) => p._id);
    if (postIds.length) {
      await Post.updateMany({ _id: { $in: postIds } }, { status: "removed" });
      await Comment.updateMany({ post: { $in: postIds } }, { status: "removed" });
    }

    res.json({ message: "Cộng đồng đã được đánh dấu xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  ADMIN GET COMMUNITY
---------------------------------------------*/
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

/*--------------------------------------------
  ADMIN DELETE COMMUNITY
---------------------------------------------*/
const deleteAvatarFile = (avatarPathRaw) => {
  if (!avatarPathRaw) return;

  const relativePath = avatarPathRaw.startsWith("/")
    ? avatarPathRaw.slice(1)
    : avatarPathRaw;

  const avatarPath = path.join(process.cwd(), "src/assets", relativePath);

  if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
};

export const adminDeleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    deleteAvatarFile(community.avatar);

    community.status = "removed";
    await community.save();

    const posts = await Post.find({ community: id }, "_id");
    const postIds = posts.map((p) => p._id);
    if (postIds.length) {
      await Post.updateMany({ _id: { $in: postIds } }, { status: "removed" });
      await Comment.updateMany({ post: { $in: postIds } }, { status: "removed" });
    }

    res.json({ message: "Admin đã đánh dấu xóa cộng đồng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  ADMIN UPDATE COMMUNITY
---------------------------------------------*/
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

/*--------------------------------------------
  LẤY DANH SÁCH CỘNG ĐỒNG ĐÃ XEM GẦN ĐÂY
---------------------------------------------*/
export const getRecentCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "recentCommunities",
      select: "name avatar description members",
    });

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Lọc community active
    const activeRecentCommunities = user.recentCommunities.filter(
      (c) => c && c.status !== "removed"
    );

    res.json(activeRecentCommunities);
  } catch (err) {
    console.error("Lỗi getRecentCommunities:", err);
    res.status(500).json({ message: err.message });
  }
};

/*--------------------------------------------
  TOGGLE NOTIFICATION (MEMBER)
---------------------------------------------*/
export const toggleNotification = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    // Kiểm tra xem user có phải là member không
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
