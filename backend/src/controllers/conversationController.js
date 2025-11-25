import Conversation from "../models/Conversation.js";
import ConversationMember from "../models/ConversationMember.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

export const createPrivateConversation = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length !== 2) {
      return res.status(400).json({ message: "Invalid users" });
    }

    const existing = await Conversation.findOne({
      isGroup: false,
      members: { $all: userIds },
      $expr: { $eq: [{ $size: "$members" }, 2] },
    });

    if (existing) {
      const membersDocs = await Conversation.populate(existing, { path: "members", select: "name avatar" });
      return res.status(200).json(membersDocs);
    }

    const conversation = new Conversation({
      isGroup: false,
      members: userIds,
      createdBy: userIds[0],
    });

    await conversation.save();

    const convMembers = userIds.map((u) => ({
      conversationId: conversation._id,
      userId: u,
    }));
    await ConversationMember.insertMany(convMembers, { ordered: false }).catch(() => {});

    const populated = await Conversation.findById(conversation._id).populate("members", "name avatar").populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatar" },
    });

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

    const conversation = new Conversation({
      isGroup: true,
      name,
      members,
      createdBy,
    });

    await conversation.save();

    const convMembers = members.map((u) => ({
      conversationId: conversation._id,
      userId: u,
    }));
    await ConversationMember.insertMany(convMembers, { ordered: false }).catch(() => {});

    const populated = await Conversation.findById(conversation._id).populate("members", "name avatar").populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatar" },
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const memberDocs = await ConversationMember.find({ userId }).lean();
    const conversationIds = memberDocs.map((m) => m.conversationId);

    const conversations = await Conversation.find({ _id: { $in: conversationIds } })
      .populate("members", "name avatar")
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
        const unreadCount = await Message.countDocuments(
          lastReadCreatedAt ? { conversationId: conv._id, createdAt: { $gt: lastReadCreatedAt } } : { conversationId: conv._id }
        );
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

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (addMembers.length > 0) {
      await Conversation.findByIdAndUpdate(conversationId, { $addToSet: { members: { $each: addMembers } } });
      const docs = addMembers.map((u) => ({ conversationId, userId: u }));
      await ConversationMember.insertMany(docs, { ordered: false }).catch(() => {});
    }

    if (removeMembers.length > 0) {
      await Conversation.findByIdAndUpdate(conversationId, { $pull: { members: { $in: removeMembers } } });
      await ConversationMember.deleteMany({ conversationId, userId: { $in: removeMembers } });
    }

    const updated = await Conversation.findById(conversationId).populate("members", "name avatar");
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
