import Community from "../models/Community.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Tạo community
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Community.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Community name already exists" });

    const community = new Community({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id],
    });

    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserCommunities = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const communities = await Community.find({ members: userId })
      .populate("creator", "username email")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (err) {
    console.error("Lỗi khi lấy communities của user:", err);
    res.status(500).json({ message: err.message });
  }
};

export const isUserMemberOfCommunity = async (accessToken, communityId) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      throw new Error("cộng đồng không tồn tại");
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return false;
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    return isMember;
  } catch (err) {
    console.error("Lỗi khi kiểm tra thành viên:", err.message);
    return false;
  }
};

// Lấy tất cả communities
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("creator", "username email")
      .sort({ createdAt: -1 });
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy 1 community theo id
export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("creator", "username email")
      .populate("members", "username email");

    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tham gia cộng đồng
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const userId = req.user.id;

    if (community.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Bạn đã ở trong cộng đồng này" });
    }

    community.members.push(userId);
    await community.save();

    res.json({ message: "Tham gia cộng đồng thành công", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rời cộng đồng
export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const userId = req.user.id;

    if (!community.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Bạn không phải thành viên của cộng đồng này" });
    }

    community.members.pull(userId);
    await community.save();

    res.json({ message: "Rời cộng đồng thành công", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin community
export const updateCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Community.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    ).populate("creator", "name email");

    if (!updated) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xoá community
export const deleteCommunity = async (req, res) => {
  try {
    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa cộng đồng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
