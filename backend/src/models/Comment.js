import mongoose from "mongoose";

/**
 * Schema bình luận
 * - Hỗ trợ bình luận đa cấp (Nested Comments) thông qua `parentComment`.
 */
const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    content: { type: String, trim: true, },
    image: { type: String },

    // Bình luận cha (nếu là reply)
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", },],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", },],

    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },

    // Thông tin kiểm duyệt
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    removedAt: { type: Date, default: null },

  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
