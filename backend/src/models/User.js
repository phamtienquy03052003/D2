import mongoose from "mongoose";

/**
 * Schema người dùng hệ thống
 * - Quản lý thông tin cá nhân, phân quyền, điểm thưởng, và cài đặt riêng tư.
 */
const userSchema = new mongoose.Schema(
  {
    // Thông tin đăng nhập
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    password: { type: String, }, // Hash password

    // Thông tin cơ bản
    name: { type: String, trim: true, },
    avatar: { type: String, },
    googleId: { type: String, }, // ID nếu đăng nhập qua Google

    role: { type: String, enum: ["user", "admin"], default: "user", },

    phone: { type: String, default: "" },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Khác" },

    isActive: { type: Boolean, default: true, },
    isPrivate: { type: Boolean, default: false }, // Chế độ riêng tư
    ChatRequestPermission: { type: String, enum: ["everyone", "over30days", "noone"], default: "everyone", },

    refreshTokens: [{ type: String, },],

    // Dữ liệu tương tác
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    recentPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    recentCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Hệ thống cấp độ và gamification
    level: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    inventory: [{ type: String }], // Danh sách ID items (NameTag) đã sở hữu
    selectedNameTag: { type: mongoose.Schema.Types.Mixed, ref: "ShopItem", default: null }, // Thẻ tên đang đeo

    slug: { type: String, unique: true, sparse: true, index: true },

    // Liên kết mạng xã hội
    socialLinks: {
      facebook: {
        url: { type: String, default: "" },
        displayName: { type: String, default: "" }
      },
      youtube: {
        url: { type: String, default: "" },
        displayName: { type: String, default: "" }
      },
      tiktok: {
        url: { type: String, default: "" },
        displayName: { type: String, default: "" }
      },
      instagram: {
        url: { type: String, default: "" },
        displayName: { type: String, default: "" }
      },
      twitter: {
        url: { type: String, default: "" },
        displayName: { type: String, default: "" }
      },
      linkedin: {
        url: { type: String, default: "" },
        displayName: { type: String, default: "" }
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text" });
export default mongoose.model("User", userSchema);
