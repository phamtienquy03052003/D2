import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: { type: String },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
