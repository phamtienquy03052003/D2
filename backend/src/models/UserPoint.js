import mongoose from "mongoose";

const userPointSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        totalPoints: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("UserPoint", userPointSchema);
