import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
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

    // Check blocking for private conversation
    if (!conversation.isGroup) {
      const otherUserId = conversation.members.find(m => m.toString() !== senderId.toString());
      if (otherUserId) {
        const otherUser = await User.findById(otherUserId);
        if (otherUser && otherUser.blockedUsers.includes(senderId)) {
          return res.status(403).json({ message: "Bạn không thể gửi tin nhắn cho người này" });
        }
        // Also check if sender blocked other user? Usually you can't send if you blocked them.
        const sender = await User.findById(senderId);
        if (sender && sender.blockedUsers.includes(otherUserId)) {
          return res.status(403).json({ message: "Bạn đã chặn người dùng này" });
        }
      }
    }

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

    const io = req.app.get("io");
    if (io) {
      // Emit to all members of the conversation
      // We need to fetch members to know who to emit to, OR emit to a room if we used rooms.
      // Current implementation joins users to their own room (userId).
      // So we iterate members.

      // We already fetched conversation above, but we need to populate members to get IDs if they are objects, 
      // or just use the array if it's IDs. 
      // conversation.members is array of ObjectIds (ref).

      conversation.members.forEach(memberId => {
        io.to(memberId.toString()).emit("new_message", populated);
      });
    }

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

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Check if user already reacted with ANY emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingReactionIndex > -1) {
      const existingReaction = message.reactions[existingReactionIndex];

      // If same emoji, remove it (toggle off)
      if (existingReaction.emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // If different emoji, update it (change reaction)
        existingReaction.emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const populated = await Message.findById(messageId).populate("sender", "name avatar");

    // Emit update
    const io = req.app.get("io");
    if (io) {
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.members.forEach((memberId) => {
          io.to(memberId.toString()).emit("message_update", populated);
        });
      }
    }

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { q } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query required" });
    }

    const messages = await Message.find({
      conversationId,
      content: { $regex: q, $options: "i" }
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50); // Limit results

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
