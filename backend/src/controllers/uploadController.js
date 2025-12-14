import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Community from "../models/Community.js";

/**
 * Xóa file Avatar cũ khỏi hệ thống
 * - Kiểm tra nếu là ảnh mặc định hoặc URL ngoài thì bỏ qua.
 */
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

/**
 * Cập nhật Avatar cho User
 * - Xóa avatar cũ nếu có.
 * - Lưu đường dẫn avatar mới.
 */
export const updateUserAvatar = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });

  const newAvatarPath = `/uploads/avatars/${req.file.filename}`;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      deleteAvatarFile(newAvatarPath);
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }


    if (user.avatar) deleteAvatarFile(user.avatar);


    user.avatar = newAvatarPath;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    console.error("❌ Lỗi updateUserAvatar:", err);
    deleteAvatarFile(newAvatarPath);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật avatar" });
  }
};

/**
 * Cập nhật Avatar cho Cộng đồng
 * - Xóa avatar cũ nếu có.
 * - Lưu đường dẫn avatar mới.
 */
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
      deleteAvatarFile(newAvatarPath);
      return res.status(404).json({ success: false, message: "Cộng đồng không tồn tại" });
    }


    if (community.avatar) deleteAvatarFile(community.avatar);


    community.avatar = newAvatarPath;
    await community.save();

    res.json({ success: true, avatar: community.avatar });
  } catch (err) {
    console.error("❌ Lỗi updateCommunityAvatar:", err);
    deleteAvatarFile(newAvatarPath);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật avatar cộng đồng" });
  }
};
