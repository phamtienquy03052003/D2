import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["general", "features", "shop", "moderation", "security"],
            default: "general",
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.models.SystemConfig || mongoose.model("SystemConfig", systemConfigSchema);
