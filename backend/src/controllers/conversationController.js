import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import ConversationMember from "../models/ConversationMember.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

/**
 * Tạo cuộc trò chuyện riêng tư (1-1)
 * - Kiểm tra nếu đã tồn tại -> Trả về cái cũ.
 * - Kiểm tra chặn (Block) giữa 2 bên.
 * - Kiểm tra quyền riêng tư (ChatRequestPermission).
 * - Tạo mới và bắn Socket sự kiện 'new_conversation'.
 */
export const createPrivateConversation = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length !== 2) {
      return res.status(400).json({ message: "Người dùng không hợp lệ" });
    }

    const creatorId = req.user.id;
    const otherUserId = userIds.find((id) => id !== creatorId.toString());


    const existing = await Conversation.findOne({
      isGroup: false,
      $or: [
        { members: { $all: userIds } },
        { members: creatorId, pendingMembers: otherUserId },
        { members: otherUserId, pendingMembers: creatorId },
      ],
    });

    if (existing) {
      const membersDocs = await Conversation.populate(existing, { path: "members", select: "name avatar" });
      return res.status(200).json(membersDocs);
    }


    const creator = await User.findById(creatorId);
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }


    if (otherUser.blockedUsers.includes(creatorId)) {
      return res.status(403).json({ message: "Bạn không thể gửi tin nhắn cho người này" });
    }
    if (creator.blockedUsers.includes(otherUserId)) {
      return res.status(403).json({ message: "Bạn đã chặn người dùng này" });
    }


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


    const conversation = new Conversation({
      isGroup: false,
      members: [creatorId],
      pendingMembers: [otherUserId],
      createdBy: creatorId,
    });

    await conversation.save();


    await ConversationMember.create({
      conversationId: conversation._id,
      userId: creatorId,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate({
        path: "members",
        select: "name avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate("pendingMembers", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });


    const io = req.app.get("io");
    if (io) {

      io.to(creatorId.toString()).emit("new_conversation", populated);

      io.to(otherUserId.toString()).emit("new_conversation", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Tạo cuộc trò chuyện nhóm (Group Chat)
 * - Yêu cầu danh sách thành viên ban đầu.
 * - Người tạo mặc định là Admin.
 * - Bắn Socket cho tất cả thành viên.
 */
export const createGroupConversation = async (req, res) => {
  try {
    const { name, members, createdBy } = req.body;
    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Dữ liệu nhóm không hợp lệ" });
    }



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


    await ConversationMember.create({
      conversationId: conversation._id,
      userId: createdBy,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate({
        path: "members",
        select: "name avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate("pendingMembers", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });


    const io = req.app.get("io");
    if (io) {

      io.to(createdBy.toString()).emit("new_conversation", populated);

      otherMembers.forEach(m => {
        io.to(m.toString()).emit("new_conversation", populated);
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Chấp nhận lời mời trò chuyện (từ Pending -> Member)
 */
export const acceptConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      pendingMembers: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }


    conversation.pendingMembers = conversation.pendingMembers.filter((id) => id.toString() !== userId.toString());
    conversation.members.push(userId);
    await conversation.save();


    await ConversationMember.create({
      conversationId: conversation._id,
      userId: userId,
    });

    const updated = await Conversation.findById(conversationId)
      .populate({
        path: "members",
        select: "name avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate("pendingMembers", "name avatar");


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

/**
 * Từ chối lời mời trò chuyện
 * - Nếu là chat 1-1 và bị từ chối -> Xóa luôn cuộc trò chuyện.
 */
export const rejectConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      pendingMembers: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }


    conversation.pendingMembers = conversation.pendingMembers.filter((id) => id.toString() !== userId.toString());




    if (!conversation.isGroup && conversation.members.length === 1) {

      await Conversation.findByIdAndDelete(conversationId);
      await ConversationMember.deleteMany({ conversationId });


      const io = req.app.get("io");
      if (io) {
        io.to(conversation.createdBy.toString()).emit("conversation_rejected", { conversationId });
      }

      return res.status(200).json({ message: "Đã từ chối và xóa cuộc hội thoại" });
    }

    await conversation.save();


    const io = req.app.get("io");
    if (io) {


      io.to(conversation.createdBy.toString()).emit("conversation_rejected", { conversationId, userId });
    }

    res.status(200).json({ message: "Đã từ chối cuộc hội thoại" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy danh sách cuộc trò chuyện của User
 * - Bao gồm chat đang tham gia và chat đang chờ (Pending).
 * - Tính toán số lượng tin nhắn chưa đọc (unreadCount).
 */
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;


    const memberDocs = await ConversationMember.find({ userId }).lean();
    const memberConversationIds = memberDocs.map((m) => m.conversationId);


    const conversations = await Conversation.find({
      $or: [
        { _id: { $in: memberConversationIds } },
        { pendingMembers: userId }
      ]
    })
      .populate({
        path: "members",
        select: "name avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
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

/**
 * Lấy chi tiết cuộc trò chuyện theo ID
 */
export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "ID cuộc hội thoại không hợp lệ" });
    }
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "members",
        select: "name avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })
      .populate("pendingMembers", "name avatar")
      .populate("admins", "name avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      });

    if (conversation) {
      console.log("Debug Conversation Members:", JSON.stringify(conversation.members.map(m => ({ name: m.name })), null, 2));
    }

    if (!conversation) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Quản lý thành viên nhóm (Thêm/Xóa)
 * - Chỉ Admin mới có quyền thực hiện.
 * - Bắn Socket cập nhật cho các thành viên.
 */
export const updateGroupMembers = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { addMembers = [], removeMembers = [] } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }


    const isAdmin = conversation.admins.some(adminId => adminId.toString() === userId.toString()) || conversation.createdBy.toString() === userId.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: "Chỉ quản trị viên mới có thể quản lý thành viên" });
    }

    if (addMembers.length > 0) {

      await Conversation.findByIdAndUpdate(conversationId, { $addToSet: { pendingMembers: { $each: addMembers } } });
    }

    if (removeMembers.length > 0) {

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
      .populate({
        path: "members",
        select: "name avatar selectedNameTag",
        populate: [
          { path: "selectedNameTag", select: "value color" }
        ]
      })

      .populate("pendingMembers", "name avatar")
      .populate("pendingMembers", "name avatar")
      .populate("admins", "name avatar");

    const io = req.app.get("io");
    if (io) {

      addMembers.forEach(uid => {
        io.to(uid.toString()).emit("new_conversation", updated);
      });


      removeMembers.forEach(uid => {
        io.to(uid.toString()).emit("conversation_removed", { conversationId });
      });


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
