import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import ConversationMember from "../models/ConversationMember.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

export const createPrivateConversation = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length !== 2) {
      return res.status(400).json({ message: "Invalid users" });
    }

    const creatorId = req.user.id;
    const otherUserId = userIds.find((id) => id !== creatorId.toString());

    // Check for existing conversation (active or pending)
    const existing = await Conversation.findOne({
      isGroup: false,
      $or: [
        { members: { $all: userIds } }, // Both are members (active)
        { members: creatorId, pendingMembers: otherUserId }, // Creator sent request
        { members: otherUserId, pendingMembers: creatorId }, // Other sent request
      ],
    });

    if (existing) {
      const membersDocs = await Conversation.populate(existing, { path: "members", select: "name avatar" });
      return res.status(200).json(membersDocs);
    }

    // Check permissions and blocking
    const creator = await User.findById(creatorId);
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check blocking
    if (otherUser.blockedUsers.includes(creatorId)) {
      return res.status(403).json({ message: "Bạn không thể gửi tin nhắn cho người này" });
    }
    if (creator.blockedUsers.includes(otherUserId)) {
      return res.status(403).json({ message: "Bạn đã chặn người dùng này" });
    }

    // Check ChatRequestPermission
    const permission = otherUser.ChatRequestPermission || "everyone";
    if (permission === "noone") {
      return res.status(403).json({ message: "Người này không nhận tin nhắn từ người lạ" });
    }
    if (permission === "over30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(creator.createdAt) > thirtyDaysAgo) {
        return res.status(403).json({ message: "Tài khoản của bạn chưa đủ 30 ngày tuổi để nhắn tin cho người này" });
      }
    }

    // Create new conversation with request
    const conversation = new Conversation({
      isGroup: false,
      members: [creatorId],
      pendingMembers: [otherUserId],
      createdBy: creatorId,
    });

    await conversation.save();

    // Add creator to ConversationMember
    await ConversationMember.create({
      conversationId: conversation._id,
      userId: creatorId,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("members", "name avatar")
      .populate("pendingMembers", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });

    // Socket emit
    const io = req.app.get("io");
    if (io) {
      // Emit to creator (already joined)
      io.to(creatorId.toString()).emit("new_conversation", populated);
      // Emit to other user (pending)
      io.to(otherUserId.toString()).emit("new_conversation", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createGroupConversation = async (req, res) => {
  try {
    const { name, members, createdBy } = req.body;
    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Invalid group data" });
    }

    // members array from frontend includes creator.
    // We need to separate creator and others.
    const otherMembers = members.filter((m) => m !== createdBy);

    const conversation = new Conversation({
      isGroup: true,
      name,
      members: [createdBy],
      admins: [createdBy],
      pendingMembers: otherMembers,
      createdBy,
    });

    await conversation.save();

    // Only add creator to ConversationMember initially
    await ConversationMember.create({
      conversationId: conversation._id,
      userId: createdBy,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("members", "name avatar")
      .populate("pendingMembers", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });

    // Socket emit
    const io = req.app.get("io");
    if (io) {
      // Emit to creator
      io.to(createdBy.toString()).emit("new_conversation", populated);
      // Emit to pending members
      otherMembers.forEach(m => {
        io.to(m.toString()).emit("new_conversation", populated);
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acceptConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      pendingMembers: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Move from pending to members
    conversation.pendingMembers = conversation.pendingMembers.filter((id) => id.toString() !== userId.toString());
    conversation.members.push(userId);
    await conversation.save();

    // Create ConversationMember
    await ConversationMember.create({
      conversationId: conversation._id,
      userId: userId,
    });

    const updated = await Conversation.findById(conversationId)
      .populate("members", "name avatar")
      .populate("pendingMembers", "name avatar");

    // Socket emit
    const io = req.app.get("io");
    if (io) {
      updated.members.forEach(m => {
        io.to(m._id.toString()).emit("conversation_accepted", updated);
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      pendingMembers: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Remove from pending
    conversation.pendingMembers = conversation.pendingMembers.filter((id) => id.toString() !== userId.toString());

    // If it's a private chat and rejected, we might want to delete it or just leave it as is (creator alone).
    // If group, just remove invitation.

    if (!conversation.isGroup && conversation.members.length === 1) {
      // Optional: Delete if 1-on-1 and rejected
      await Conversation.findByIdAndDelete(conversationId);
      await ConversationMember.deleteMany({ conversationId });

      // Notify creator that request was rejected/deleted
      const io = req.app.get("io");
      if (io) {
        io.to(conversation.createdBy.toString()).emit("conversation_rejected", { conversationId });
      }

      return res.status(200).json({ message: "Conversation rejected and deleted" });
    }

    await conversation.save();

    // Notify group members (if group) or creator
    const io = req.app.get("io");
    if (io) {
      // If group, maybe just notify admins? or just creator?
      // For now, notify creator
      io.to(conversation.createdBy.toString()).emit("conversation_rejected", { conversationId, userId });
    }

    res.status(200).json({ message: "Conversation rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get conversations where user is a member
    const memberDocs = await ConversationMember.find({ userId }).lean();
    const memberConversationIds = memberDocs.map((m) => m.conversationId);

    // Get conversations where user is a pending member OR a member
    const conversations = await Conversation.find({
      $or: [
        { _id: { $in: memberConversationIds } },
        { pendingMembers: userId }
      ]
    })
      .populate("members", "name avatar")
      .populate("pendingMembers", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const convMap = {};
    memberDocs.forEach((m) => {
      convMap[m.conversationId.toString()] = m;
    });

    const results = await Promise.all(
      conversations.map(async (conv) => {
        const mDoc = convMap[conv._id.toString()];
        let lastReadCreatedAt = null;
        if (mDoc && mDoc.lastReadMessageId) {
          const lastReadMsg = await Message.findById(mDoc.lastReadMessageId).select("createdAt").lean();
          if (lastReadMsg) lastReadCreatedAt = lastReadMsg.createdAt;
        }

        // If user is pending, unread count might be all messages or 0. Let's say 0 or just total messages?
        // Usually requests show "1 request" or something.
        // For now, calculate unread count normally if member.

        let unreadCount = 0;
        if (mDoc) {
          unreadCount = await Message.countDocuments(
            lastReadCreatedAt ? { conversationId: conv._id, createdAt: { $gt: lastReadCreatedAt } } : { conversationId: conv._id }
          );
        }

        return { ...conv, unreadCount };
      })
    );

    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }
    const conversation = await Conversation.findById(conversationId)
      .populate("members", "name avatar")
      .populate("pendingMembers", "name avatar")
      .populate("admins", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });

    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGroupMembers = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { addMembers = [], removeMembers = [] } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = conversation.admins.some(adminId => adminId.toString() === userId.toString()) || conversation.createdBy.toString() === userId.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can manage members" });
    }

    if (addMembers.length > 0) {
      // Add to pendingMembers, not members directly
      await Conversation.findByIdAndUpdate(conversationId, { $addToSet: { pendingMembers: { $each: addMembers } } });
    }

    if (removeMembers.length > 0) {
      // Remove from members AND pendingMembers
      await Conversation.findByIdAndUpdate(conversationId, {
        $pull: {
          members: { $in: removeMembers },
          pendingMembers: { $in: removeMembers },
          admins: { $in: removeMembers }
        }
      });
      await ConversationMember.deleteMany({ conversationId, userId: { $in: removeMembers } });
    }

    const updated = await Conversation.findById(conversationId)
      .populate("members", "name avatar")
      .populate("pendingMembers", "name avatar")
      .populate("admins", "name avatar");

    const io = req.app.get("io");
    if (io) {
      // Notify added members
      addMembers.forEach(uid => {
        io.to(uid.toString()).emit("new_conversation", updated);
      });

      // Notify removed members
      removeMembers.forEach(uid => {
        io.to(uid.toString()).emit("conversation_removed", { conversationId });
      });

      // Notify existing members of update
      updated.members.forEach(m => {
        if (!addMembers.includes(m._id.toString()) && !removeMembers.includes(m._id.toString())) {
          io.to(m._id.toString()).emit("conversation_updated", updated);
        }
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
