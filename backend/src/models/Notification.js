import mongoose from "mongoose";

/**
 * Schema thông báo (Notifications)
 * - Lưu trữ các sự kiện tương tác để thông báo cho người dùng.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người nhận thông báo
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người tạo ra hành động

    type: {
      type: String,
      enum: ["comment", "reply", "like", "dislike", "vote", "new_post_in_community", "new_post_from_following", "report_resolved", "system", "community_invite"],
      required: true
    },

    // Đối tượng liên quan
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },

    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
