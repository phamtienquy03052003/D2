import mongoose from "mongoose";

/**
 * Schema quản lý thành viên trong hội thoại
 * - Dùng để lưu trạng thái đọc tin nhắn (lastReadMessageId).
 */
const conversationMemberSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Tin nhắn cuối cùng đã đọc
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ConversationMember", conversationMemberSchema);
