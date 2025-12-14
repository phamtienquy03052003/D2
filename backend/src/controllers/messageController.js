import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import ConversationMember from "../models/ConversationMember.js";
import mongoose from "mongoose";
import SocketService from "../services/SocketService.js";

/**
 * Gửi tin nhắn
 * - Kiểm tra thành viên có trong hội thoại không.
 * - Kiểm tra chặn (Block) nếu là chat 1-1.
 * - Tạo tin nhắn và cập nhật `lastMessage` cho hội thoại.
 * - Bắn Socket realtime sự kiện 'new_message'.
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content, type, fileUrl } = req.body;

    if (!conversationId || !senderId) {
      return res.status(400).json({ message: "Cần có conversationId và senderId" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });

    const isMember = conversation.members.some((m) => m.toString() === senderId.toString());
    if (!isMember) return res.status(403).json({ message: "Người gửi không có trong cuộc hội thoại" });


    if (!conversation.isGroup) {
      const otherUserId = conversation.members.find(m => m.toString() !== senderId.toString());
      if (otherUserId) {
        const otherUser = await User.findById(otherUserId);
        if (otherUser && otherUser.blockedUsers.includes(senderId)) {
          return res.status(403).json({ message: "Bạn không thể gửi tin nhắn cho người này" });
        }

        const sender = await User.findById(senderId);
        if (sender && sender.blockedUsers.includes(otherUserId)) {
          return res.status(403).json({ message: "Bạn đã chặn người dùng này" });
        }
      }
    }

    if ((type === "image" || type === "file") && !fileUrl) {
      return res.status(400).json({ message: "Cần có fileUrl cho tin nhắn không phải văn bản" });
    }

    const message = new Message({
      conversationId,
      sender: senderId,
      content,
      type: type || "text",
      fileUrl,
    });

    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: Date.now() });

    const populated = await Message.findById(message._id).populate({
      path: "sender",
      select: "name avatar selectedNameTag",
      populate: [
        { path: "selectedNameTag", select: "value color" }
      ]
    });


    conversation.members.forEach(memberId => {
      SocketService.emitNewMessage(memberId.toString(), populated);
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy danh sách tin nhắn của hội thoại (Phân trang)
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "ID cuộc hội thoại không hợp lệ" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("Debug Messages Sender:", JSON.stringify(messages.slice(0, 1).map(m => ({ content: m.content, sender: m.sender?.name })), null, 2));

    res.status(200).json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Đánh dấu đã đọc tin nhắn
 * - Cập nhật `lastReadMessageId` cho User trong hội thoại đó.
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, lastReadMessageId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({ message: "Cần có conversationId và userId" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    let msgIdToSet = lastReadMessageId;

    if (!msgIdToSet) {
      const lastMsg = await Message.findOne({ conversationId }).sort({ createdAt: -1 }).select("_id").lean();
      if (lastMsg) msgIdToSet = lastMsg._id;
    }

    await ConversationMember.findOneAndUpdate(
      { conversationId, userId },
      { lastReadMessageId: msgIdToSet },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Đã đánh dấu là đã đọc" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Thả cảm xúc (Reaction) vào tin nhắn
 * - Nếu đã thả emoji đó -> Gỡ.
 * - Nếu chưa -> Thêm mới hoặc thay đổi emoji.
 * - Bắn Socket cập nhật reaction.
 */
export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Không tìm thấy tin nhắn" });


    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingReactionIndex > -1) {
      const existingReaction = message.reactions[existingReactionIndex];


      if (existingReaction.emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {

        existingReaction.emoji = emoji;
      }
    } else {

      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const populated = await Message.findById(message._id).populate({
      path: "sender",
      select: "name avatar selectedNameTag",
      populate: [
        { path: "selectedNameTag", select: "value color" }
      ]
    });


    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      conversation.members.forEach((memberId) => {
        SocketService.emitMessageUpdate(memberId.toString(), populated);
      });
    }

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Tìm kiếm tin nhắn trong hội thoại
 */
export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { q } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "ID cuộc hội thoại không hợp lệ" });
    }

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Cần có từ khóa tìm kiếm" });
    }

    const messages = await Message.find({
      conversationId,
      content: { $regex: q, $options: "i" }
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
