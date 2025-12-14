import mongoose from "mongoose";

/**
 * Schema tin nhắn Modmail
 * - Nội dung trao đổi trong ModConversation.
 */
const ModMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "ModConversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["user", "mod", "system"], required: true },
    text: { type: String, default: "" },

    attachments: [
      {
        url: String,
        filename: String,
      },
    ],
  },
  { timestamps: true }
);

ModMessageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("ModMessage", ModMessageSchema);
