import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        hasNotifications: { type: Boolean, default: true }, // Default to true when following
    },
    { timestamps: true }
);

// Ensure a user can only follow another user once
followSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model("Follow", followSchema);
