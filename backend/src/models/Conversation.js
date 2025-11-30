import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    avatar: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
