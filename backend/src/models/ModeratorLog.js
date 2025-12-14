import mongoose from "mongoose";

/**
 * Schema nhật ký kiểm duyệt (Moderator Logs)
 * - Ghi lại hành động của Mod trong cộng đồng (Duyệt bài, xóa bài, kick thành viên...)
 */
const moderatorLogSchema = new mongoose.Schema(
    {
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetModel" },
        targetModel: { type: String, required: true, enum: ["User", "Post", "Comment", "Community"] },
        community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
        details: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("ModeratorLog", moderatorLogSchema);
