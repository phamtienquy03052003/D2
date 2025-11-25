import User from "../models/User.js";
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

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thông tin public của user theo id
export const getUserPublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name avatar role");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const result = user.toObject();
    if (result.avatar && !result.avatar.startsWith("http")) {
      const base = process.env.BACKEND_URL || "http://localhost:8000";
      result.avatar = `${base}${result.avatar}`;
    }

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

