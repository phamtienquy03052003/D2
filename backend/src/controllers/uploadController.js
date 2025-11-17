import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Community from "../models/Community.js";

export const deleteAvatarFile = (avatarPathRaw) => {
  try {
    if (!avatarPathRaw || avatarPathRaw.startsWith("http")) return;

    const relativePath = avatarPathRaw.startsWith("/")
      ? avatarPathRaw.slice(1)
      : avatarPathRaw;

    const absolutePath = path.join(process.cwd(), "src/assets", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log("✅ Đã xóa avatar:", absolutePath);
    }
  } catch (err) {
    console.warn("⚠️ Không thể xóa avatar:", avatarPathRaw, err.message);
  }
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });

  const newAvatarPath = `/uploads/avatars/${req.file.filename}`;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      deleteAvatarFile(newAvatarPath); // rollback file mới
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) deleteAvatarFile(user.avatar);

    // Cập nhật avatar mới
    user.avatar = newAvatarPath;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    console.error("❌ Lỗi updateUserAvatar:", err);
    deleteAvatarFile(newAvatarPath); // rollback file mới nếu lỗi
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật avatar" });
  }
};

export const updateCommunityAvatar = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });

  const { communityId } = req.body;
  if (!communityId) {
    const newPath = `/uploads/communityAvatars/${req.file.filename}`;
    deleteAvatarFile(newPath);
    return res.status(400).json({ success: false, message: "Thiếu communityId trong yêu cầu" });
  }

  const newAvatarPath = `/uploads/communityAvatars/${req.file.filename}`;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      deleteAvatarFile(newAvatarPath); // rollback file mới
      return res.status(404).json({ success: false, message: "Cộng đồng không tồn tại" });
    }

    // Xóa avatar cũ nếu có
    if (community.avatar) deleteAvatarFile(community.avatar);

    // Cập nhật avatar mới
    community.avatar = newAvatarPath;
    await community.save();

    res.json({ success: true, avatar: community.avatar });
  } catch (err) {
    console.error("❌ Lỗi updateCommunityAvatar:", err);
    deleteAvatarFile(newAvatarPath); // rollback file mới nếu lỗi
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật avatar cộng đồng" });
  }
};
