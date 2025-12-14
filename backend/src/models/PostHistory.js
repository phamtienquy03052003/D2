import mongoose from "mongoose";

const postHistorySchema = new mongoose.Schema(
    {
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        title: { type: String, required: true },
        content: { type: String },
        image: { type: String },
        images: [{ type: String }],
        video: { type: String },
        linkUrl: { type: String },
        editedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("PostHistory", postHistorySchema);
