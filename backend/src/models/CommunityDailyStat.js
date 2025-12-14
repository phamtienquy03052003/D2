import mongoose from "mongoose";

const communityDailyStatSchema = new mongoose.Schema(
    {
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
            index: true,
        },
        date: {
            type: String, 
            required: true,
            index: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        uniqueVisitors: {
            type: Number,
            default: 0,
        },
        newMembers: {
            type: Number,
            default: 0,
        },
        visitedIps: {
            type: [String],
            default: [],
            select: false, 
        },
    },
    { timestamps: true }
);


communityDailyStatSchema.index({ community: 1, date: 1 }, { unique: true });

export default mongoose.model("CommunityDailyStat", communityDailyStatSchema);
