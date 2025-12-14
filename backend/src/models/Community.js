import mongoose from "mongoose";

/**
 * Schema cộng đồng (Community/Subreddit like)
 */
const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },

    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Cài đặt cộng đồng
    isPrivate: { type: Boolean, default: false },
    isApproval: { type: Boolean, default: false }, // Yêu cầu duyệt thành viên
    postApprovalRequired: { type: Boolean, default: false }, // Yêu cầu duyệt bài viết

    pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách chờ duyệt

    // Danh sách thành viên bị hạn chế (Mute)
    restrictedUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        restrictedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
      },
    ],

    notificationSubscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },
    slug: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

communitySchema.index({ name: "text", description: "text" });
export default mongoose.model("Community", communitySchema);
