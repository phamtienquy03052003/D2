import mongoose from "mongoose";

/**
 * Schema tổng điểm người dùng
 * - Lưu tổng điểm hiện tại của user (Dùng để đổi quà, mua vật phẩm).
 */
const userPointSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        totalPoints: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("UserPoint", userPointSchema);
