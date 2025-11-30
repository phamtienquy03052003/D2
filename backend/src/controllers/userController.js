import User from "../models/User.js";
import Follow from "../models/Follow.js";
import UserPoint from "../models/UserPoint.js";
import Community from "../models/Community.js";
import ExperienceHistory from "../models/ExperienceHistory.js";
import { deleteAvatarFile } from "./uploadController.js";
import bcrypt from "bcrypt";

// Lấy thông tin người dùng hiện tại (qua token)
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password -refreshTokens");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user = user.toObject();

    // Ghép địa chỉ đầy đủ cho avatar nếu chưa có http
    if (user.avatar && !user.avatar.startsWith("http")) {
      const base = process.env.BACKEND_URL || "http://localhost:8000";
      user.avatar = `${base}${user.avatar}`;
    }

    // Count joined communities
    const communityCount = await Community.countDocuments({ members: req.user.id, status: "active" });
    user.communityCount = communityCount;

    // Fetch total points
    const userPoint = await UserPoint.findOne({ user: req.user.id });
    user.totalPoints = userPoint ? userPoint.totalPoints : 0;

    // Count followers
    const followerCount = await Follow.countDocuments({ following: req.user.id });
    user.followerCount = followerCount;

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thông tin public của user theo id
export const getUserPublic = async (req, res) => {
  try {
    // Select blockedUsers to check, but don't return it
    const user = await User.findById(req.params.id).select("name avatar role isPrivate blockedUsers createdAt level selectedNameTag");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const result = user.toObject();

    // Check if requester is blocked
    if (req.user && result.blockedUsers && result.blockedUsers.map(id => id.toString()).includes(req.user.id)) {
      result.isBlocked = true;
    } else {
      result.isBlocked = false;
    }

    // Remove sensitive data
    delete result.blockedUsers;

    if (result.avatar && !result.avatar.startsWith("http")) {
      const base = process.env.BACKEND_URL || "http://localhost:8000";
      result.avatar = `${base}${result.avatar}`;
    }

    // Fetch total points
    const userPoint = await UserPoint.findOne({ user: req.params.id });
    result.totalPoints = userPoint ? userPoint.totalPoints : 0;

    // Count joined communities
    const communityCount = await Community.countDocuments({ members: req.params.id, status: "active" });
    result.communityCount = communityCount;

    // Count followers
    const followerCount = await Follow.countDocuments({ following: req.params.id });
    result.followerCount = followerCount;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }

    const users = await User.find({
      name: { $regex: q, $options: "i" }
    })
      .select("name avatar email role isActive")
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin cá nhân (tên)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    if (!name) return res.status(400).json({ message: "Tên không được để trống" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    ).select("-password -refreshTokens");

    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi mật khẩu
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thay đổi trạng thái private
export const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isPrivate } = req.body;

    if (typeof isPrivate !== "boolean") {
      return res.status(400).json({ message: "isPrivate phải là true/false" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { isPrivate },
      { new: true }
    ).select("-password -refreshTokens");

    res.json({
      message: "Cập nhật quyền riêng tư thành công",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật số điện thoại
export const updatePhone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      { phone },
      { new: true }
    ).select("-password -refreshTokens");

    res.json({
      message: "Cập nhật số điện thoại thành công",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật giới tính
export const updateGender = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gender } = req.body;

    if (!["Nam", "Nữ", "Khác"].includes(gender)) {
      return res.status(400).json({ message: "Giới tính không hợp lệ" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { gender },
      { new: true }
    ).select("-password -refreshTokens");

    res.json({
      message: "Cập nhật giới tính thành công",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật quyền gửi tin nhắn
export const updateChatRequestPermission = async (req, res) => {
  try {
    const userId = req.user.id;
    const { permission } = req.body;

    if (!["everyone", "over30days", "noone"].includes(permission)) {
      return res.status(400).json({ message: "Quyền không hợp lệ" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { ChatRequestPermission: permission },
      { new: true }
    ).select("-password -refreshTokens");

    res.json({
      message: "Cập nhật quyền nhắn tin thành công",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thẻ tên
export const updateNameTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nameTagId } = req.body; // nameTagId có thể là null để gỡ thẻ

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (nameTagId) {
      // Kiểm tra xem user có sở hữu thẻ này không
      if (!user.inventory || !user.inventory.includes(nameTagId)) {
        return res.status(400).json({ message: "Bạn chưa sở hữu thẻ tên này" });
      }
    }

    user.selectedNameTag = nameTagId;
    await user.save();

    res.json({
      message: "Cập nhật thẻ tên thành công",
      selectedNameTag: user.selectedNameTag
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách người dùng (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin người dùng (Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, avatar } = req.body;
    const updateFields = { name, email, role, isActive };

    if (avatar === "") {
      const existingUser = await User.findById(id).select("avatar");
      if (existingUser && existingUser.avatar) {
        deleteAvatarFile(existingUser.avatar);
      }
      updateFields.avatar = "";
    }

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa người dùng (Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.avatar) deleteAvatarFile(user.avatar);

    await User.findByIdAndDelete(id);

    res.json({ message: "Xóa người dùng thành công và dọn avatar" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Chặn người dùng
export const blockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.body;

    if (userId === targetId) {
      return res.status(400).json({ message: "Không thể chặn chính mình" });
    }

    const user = await User.findById(userId);
    if (!user.blockedUsers.includes(targetId)) {
      user.blockedUsers.push(targetId);
      await user.save();
    }

    res.json({ message: "Đã chặn người dùng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bỏ chặn người dùng
export const unblockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.body;

    const user = await User.findById(userId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetId);
    await user.save();

    res.json({ message: "Đã bỏ chặn người dùng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách người dùng bị chặn
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("blockedUsers", "name avatar email selectedNameTag");

    const blockedUsers = user.blockedUsers.map(u => {
      const obj = u.toObject();
      if (obj.avatar && !obj.avatar.startsWith("http")) {
        const base = process.env.BACKEND_URL || "http://localhost:8000";
        obj.avatar = `${base}${obj.avatar}`;
      }
      return obj;
    });

    res.json(blockedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.body;

    if (followerId === followingId) {
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình" });
    }

    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (existingFollow) {
      return res.status(400).json({ message: "Đã theo dõi người dùng này rồi" });
    }

    const newFollow = new Follow({ follower: followerId, following: followingId });
    await newFollow.save();

    res.json({ message: "Đã theo dõi thành công", follow: newFollow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.body;

    const deletedFollow = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    if (!deletedFollow) {
      return res.status(400).json({ message: "Chưa theo dõi người dùng này" });
    }

    res.json({ message: "Đã bỏ theo dõi thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle follow notification
export const toggleFollowNotification = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.body;

    const follow = await Follow.findOne({ follower: followerId, following: followingId });
    if (!follow) {
      return res.status(400).json({ message: "Chưa theo dõi người dùng này" });
    }

    follow.hasNotifications = !follow.hasNotifications;
    await follow.save();

    res.json({ message: "Đã cập nhật cài đặt thông báo", hasNotifications: follow.hasNotifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get follow status
export const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.params;

    const follow = await Follow.findOne({ follower: followerId, following: followingId });

    if (follow) {
      res.json({ isFollowing: true, hasNotifications: follow.hasNotifications });
    } else {
      res.json({ isFollowing: false, hasNotifications: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách người theo dõi mình
export const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const followers = await Follow.find({ following: userId })
      .populate("follower", "name avatar email level selectedNameTag")
      .sort({ createdAt: -1 });

    const result = followers.map(f => {
      if (!f.follower) return null; // Handle case where user might be deleted
      const user = f.follower.toObject();
      if (user.avatar && !user.avatar.startsWith("http")) {
        const base = process.env.BACKEND_URL || "http://localhost:8000";
        user.avatar = `${base}${user.avatar}`;
      }
      return user;
    }).filter(u => u !== null);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử kinh nghiệm
export const getXPHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ExperienceHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
