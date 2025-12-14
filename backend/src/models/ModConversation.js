import mongoose from "mongoose";

const ModConversationSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    starter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    subject: { type: String, default: "" },
    status: { type: String, enum: ["open", "pending", "closed"], default: "open" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    archived: { type: Boolean, default: false },
    tags: [{ type: String }],
    lastMessagePreview: { type: String, default: "" },

    unreadCountForMods: { type: Number, default: 0 },
    unreadCountForUser: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ModConversationSchema.index({ community: 1, updatedAt: -1 });

export default mongoose.model("ModConversation", ModConversationSchema);
