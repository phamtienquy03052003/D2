import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
    isApproval: { type: Boolean, default: false },
    pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    restrictedUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        restrictedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date }, // null = vĩnh viễn (nếu có logic đó), hoặc bắt buộc có time
      },
    ],
    notificationSubscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    postApprovalRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

communitySchema.index({ name: "text", description: "text" });
export default mongoose.model("Community", communitySchema);
