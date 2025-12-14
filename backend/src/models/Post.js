import mongoose from "mongoose";

/**
 * Schema bài viết
 * - Chứa nội dung, hình ảnh, video, và thông tin tương tác (vote, comment).
 */
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },

    // Media
    image: { type: String },
    images: [{ type: String }],
    video: { type: String },
    linkUrl: { type: String },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },

    // Chia sẻ bài viết (Re-post)
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    // Tương tác
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    isLocked: { type: Boolean, default: false }, // Khóa bình luận
    status: {
      type: String,
      enum: ["active", "pending", "removed", "rejected"],
      default: "active",
      index: true,
    },

    // Lịch sử chỉnh sửa
    isEdited: { type: Boolean, default: false },
    editedStatus: {
      type: String,
      enum: ["not_edited", "edited_pending", "edited_seen"],
      default: "not_edited",
    },

    approvedAt: { type: Date, default: null },

    // Thông tin kiểm duyệt (nếu bị xóa)
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    removedAt: { type: Date, default: null },

    slug: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text" });
export default mongoose.model("Post", postSchema);