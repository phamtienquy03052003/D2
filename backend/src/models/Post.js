import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    image: { type: String },
    images: [{ type: String }], // Mảng chứa nhiều ảnh
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    status: {
      type: String,
      enum: ["active", "pending", "removed", "rejected"],
      default: "active",
      index: true,
    },
    isEdited: { type: Boolean, default: false },
    editedStatus: {
      type: String,
      enum: ["not_edited", "edited_pending", "edited_seen"],
      default: "not_edited",
    },
    approvedAt: { type: Date, default: null },
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

postSchema.index({ title: "text", content: "text" });
export default mongoose.model("Post", postSchema);