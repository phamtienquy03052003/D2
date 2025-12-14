import mongoose from "mongoose";

/**
 * Schema theo dõi (Follow)
 * - Lưu mối quan hệ follower-following giữa các user.
 */
const followSchema = new mongoose.Schema(
    {
        follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        hasNotifications: { type: Boolean, default: true }, // Nhận thông báo khi người này đăng bài
    },
    { timestamps: true }
);


followSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model("Follow", followSchema);
