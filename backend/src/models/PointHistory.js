import mongoose from "mongoose";

const pointHistorySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        type: { type: String, enum: ["add", "subtract"], required: true },
        relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: "onModel" },
        onModel: { type: String, enum: ["Post", "Comment", "User"] },
    },
    { timestamps: true }
);

export default mongoose.model("PointHistory", pointHistorySchema);
