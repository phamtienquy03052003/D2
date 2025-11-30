import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    password: { type: String, },
    name: { type: String, trim: true, },
    avatar: { type: String, },
    googleId: { type: String, },
    role: { type: String, enum: ["user", "admin"], default: "user", },
    phone: { type: String, default: "" },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Khác" },
    isActive: { type: Boolean, default: true, },
    isPrivate: { type: Boolean, default: false },
    ChatRequestPermission: { type: String, enum: ["everyone", "over30days", "noone"], default: "everyone", },
    refreshTokens: [{ type: String, },],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    recentPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    recentCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    inventory: [{ type: String }], // Array of item IDs
    selectedNameTag: { type: String, default: null }, // ID of the selected name tag
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text" });
export default mongoose.model("User", userSchema);
