import mongoose from "mongoose";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import UserPoint from "../models/UserPoint.js";
import Community from "../models/Community.js";
import ExperienceHistory from "../models/ExperienceHistory.js";
import { deleteAvatarFile } from "./uploadController.js";
import bcrypt from "bcrypt";
import slugify from "slugify";
import { nanoid } from "nanoid";


/**
 * Lấy thông tin cá nhân của người dùng đang đăng nhập
 * - Bao gồm thông tin cơ bản, điểm, số lượng cộng đồng, người theo dõi.
 */
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password -refreshTokens");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });


    if (mongoose.Types.ObjectId.isValid(user.selectedNameTag)) {
      await user.populate("selectedNameTag", "name value color");
    }

    user = user.toObject();


    if (user.avatar && !user.avatar.startsWith("http")) {
      const base = process.env.BACKEND_URL || "http://localhost:8000";
      user.avatar = `${base}${user.avatar}`;
    }


    const communityCount = await Community.countDocuments({ members: req.user.id, status: "active" });
    user.communityCount = communityCount;


    const userPoint = await UserPoint.findOne({ user: req.user.id });
    user.totalPoints = userPoint ? userPoint.totalPoints : 0;


    const followerCount = await Follow.countDocuments({ following: req.user.id });
    user.followerCount = followerCount;

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy thông tin công khai của người dùng (theo ID hoặc Slug)
 * - Kiểm tra nếu user bị chặn.
 * - Trả về thông tin cơ bản, điểm, danh hiệu.
 */
export const getUserPublic = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const user = await User.findOne(query)
      .select("name avatar role isPrivate blockedUsers createdAt level selectedNameTag slug socialLinks");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });


    if (mongoose.Types.ObjectId.isValid(user.selectedNameTag)) {
      await user.populate("selectedNameTag", "name value color");
    }

    const result = user.toObject();


    if (req.user && result.blockedUsers && result.blockedUsers.map(id => id.toString()).includes(req.user.id)) {
      result.isBlocked = true;
    } else {
      result.isBlocked = false;
    }


    delete result.blockedUsers;

    if (result.avatar && !result.avatar.startsWith("http")) {
      const base = process.env.BACKEND_URL || "http://localhost:8000";
      result.avatar = `${base}${result.avatar}`;
    }


    const userPoint = await UserPoint.findOne({ user: user._id });
    result.totalPoints = userPoint ? userPoint.totalPoints : 0;


    const communityCount = await Community.countDocuments({ members: user._id, status: "active" });
    result.communityCount = communityCount;


    const followerCount = await Follow.countDocuments({ following: user._id });
    result.followerCount = followerCount;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Tìm kiếm người dùng theo tên
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }

    const users = await User.find({
      name: { $regex: q, $options: "i" }
    })
      .select("name avatar email role isActive slug")
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Cập nhật thông tin hồ sơ (Tên, Liên kết mạng xã hội)
 * - Tự động cập nhật slug nếu đổi tên.
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, socialLinks } = req.body;
    const userId = req.user.id;
    if (!name) return res.status(400).json({ message: "Tên không được để trống" });

    const updateData = { name };


    let slug = slugify(name, { lower: true, strict: true });

    const existingSlug = await User.findOne({ slug, _id: { $ne: userId } });
    if (existingSlug) {
      slug = `${slug}-${nanoid(6)}`;
    }
    updateData.slug = slug;

    if (socialLinks) {
      updateData.socialLinks = socialLinks;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
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


/**
 * Đổi mật khẩu
 */
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


/**
 * Cập nhật chế độ riêng tư (Public/Private Profile)
 */
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


/**
 * Cập nhật số điện thoại
 */
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


/**
 * Cập nhật giới tính
 */
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


/**
 * Cập nhật quyền nhận tin nhắn (Everyone, Over30Days, Noone)
 */
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


/**
 * Cập nhật danh hiệu (NameTag) đang sử dụng
 */
export const updateNameTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nameTagId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (nameTagId) {

      if (!user.inventory || !user.inventory.some(id => id.toString() === nameTagId)) {
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




/**
 * Lấy danh sách tất cả người dùng (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Cập nhật thông tin người dùng (Admin)
 */
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


/**
 * Xóa người dùng (Admin)
 */
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



/**
 * Chặn người dùng (Block)
 */
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


/**
 * Bỏ chặn người dùng (Unblock)
 */
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


/**
 * Lấy danh sách người dùng đã chặn
 */
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("blockedUsers", "name avatar email selectedNameTag slug");

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


/**
 * Theo dõi người dùng
 */
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    let { followingId } = req.body;


    if (followingId && !mongoose.Types.ObjectId.isValid(followingId)) {
      const targetUser = await User.findOne({ slug: followingId });
      if (!targetUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      followingId = targetUser._id.toString();
    }

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


/**
 * Bỏ theo dõi người dùng
 */
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    let { followingId } = req.body;


    if (followingId && !mongoose.Types.ObjectId.isValid(followingId)) {
      const targetUser = await User.findOne({ slug: followingId });
      if (!targetUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      followingId = targetUser._id.toString();
    }

    const deletedFollow = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    if (!deletedFollow) {
      return res.status(400).json({ message: "Chưa theo dõi người dùng này" });
    }

    res.json({ message: "Đã bỏ theo dõi thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Bật/Tắt thông báo từ người đang theo dõi
 */
export const toggleFollowNotification = async (req, res) => {
  try {
    const followerId = req.user.id;
    let { followingId } = req.body;


    if (followingId && !mongoose.Types.ObjectId.isValid(followingId)) {
      const targetUser = await User.findOne({ slug: followingId });
      if (!targetUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      followingId = targetUser._id.toString();
    }

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


/**
 * Kiểm tra trạng thái theo dõi
 */
export const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    let { followingId } = req.params;


    if (followingId && !mongoose.Types.ObjectId.isValid(followingId)) {
      const targetUser = await User.findOne({ slug: followingId });
      if (!targetUser) return res.json({ isFollowing: false, hasNotifications: false });
      followingId = targetUser._id.toString();
    }

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


/**
 * Lấy danh sách người đang theo dõi mình (Followers)
 */
export const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const followers = await Follow.find({ following: userId })
      .populate({
        path: "follower",
        select: "name avatar email level selectedNameTag slug",
        populate: [
          { path: "selectedNameTag", select: "name value color" }
        ]
      })
      .sort({ createdAt: -1 });

    const result = followers.map(f => {
      if (!f.follower) return null;
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


/**
 * Lấy lịch sử kinh nghiệm (XP History)
 */
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
