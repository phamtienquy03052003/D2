import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import ConversationMember from "../models/ConversationMember.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content, type, fileUrl } = req.body;

    if (!conversationId || !senderId) {
      return res.status(400).json({ message: "conversationId and senderId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const isMember = conversation.members.some((m) => m.toString() === senderId.toString());
    if (!isMember) return res.status(403).json({ message: "Sender not in conversation" });

    if ((type === "image" || type === "file") && !fileUrl) {
      return res.status(400).json({ message: "fileUrl required for non-text message" });
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

    const populated = await Message.findById(message._id).populate("sender", "name avatar");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, lastReadMessageId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({ message: "conversationId and userId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid IDs" });
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

    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
