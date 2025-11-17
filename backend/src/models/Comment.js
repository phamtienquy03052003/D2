import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    content: { type: String, required: true, trim: true, },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",}, ],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",}, ],
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },
    // Để lưu lại ai là người xóa (Mod hoặc chính tác giả)
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Lưu thời gian xóa để sort
    removedAt: { type: Date, default: null },
    
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
