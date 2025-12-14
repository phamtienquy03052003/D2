import ModConversation from "../models/ModConversation.js";
import ModMessage from "../models/ModMessage.js";
import Community from "../models/Community.js";
import { getIO } from "../socket/index.js";


/**
 * Tạo cuộc hội thoại ModMail mới (User gửi cho Mod Team)
 */
export const createConversation = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { subject, text } = req.body;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const conv = await ModConversation.create({
      community: communityId,
      starter: userId,
      subject: subject || "",
      lastMessagePreview: text.substring(0, 100),
      unreadCountForMods: 1,
    });

    const msg = await ModMessage.create({
      conversation: conv._id,
      sender: userId,
      senderRole: "user",
      text,
    });


    await msg.populate({ path: "sender", select: "name avatar" });






    return res.status(201).json({ conversation: conv, message: msg });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách ModMail của User (User xem danh sách mình đã gửi)
 */
export const getConversationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;


    const convs = await ModConversation.find({ starter: userId })
      .sort({ updatedAt: -1 })
      .populate({ path: "community", select: "name avatar" })
      .populate({ path: "assignee", select: "name avatar" });

    return res.json(convs);
  } catch (err) {
    console.error("Error in getConversationsForUser:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách ModMail cho Mod (Mod xem danh sách trong cộng đồng)
 */
export const getConversationsForMods = async (req, res) => {
  try {
    const { communityId } = req.params;


    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });


    const isCreator = community.creator.toString() === req.user.id;
    const isModerator = community.moderators.some(
      (modId) => modId.toString() === req.user.id
    );

    if (!isCreator && !isModerator) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }


    const convs = await ModConversation.find({ community: communityId })
      .sort({ updatedAt: -1 })
      .populate({ path: "starter", select: "name avatar" })
      .populate({ path: "assignee", select: "name avatar" });

    return res.json(convs);
  } catch (err) {
    console.error("Error in getConversationsForMods:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Tìm kiếm ModMail
 */
export const searchConversations = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { query, status, assignee, priority, archived } = req.query;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const isCreator = community.creator.toString() === req.user.id;
    const isModerator = community.moderators.some(
      (modId) => modId.toString() === req.user.id
    );

    if (!isCreator && !isModerator) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }


    const filter = { community: communityId };

    if (status) filter.status = status;
    if (assignee === "unassigned") filter.assignee = null;
    else if (assignee === "me") filter.assignee = req.user.id;
    else if (assignee && assignee !== "all") filter.assignee = assignee;

    if (priority) filter.priority = priority;
    if (archived !== undefined) filter.archived = archived === "true";


    let conversations;
    if (query) {
      conversations = await ModConversation.find({
        ...filter,
        $or: [
          { subject: { $regex: query, $options: "i" } },
          { lastMessagePreview: { $regex: query, $options: "i" } },
        ],
      })
        .sort({ updatedAt: -1 })
        .populate({ path: "starter", select: "name avatar" })
        .populate({ path: "assignee", select: "name avatar" });
    } else {
      conversations = await ModConversation.find(filter)
        .sort({ updatedAt: -1 })
        .populate({ path: "starter", select: "name avatar" })
        .populate({ path: "assignee", select: "name avatar" });
    }

    return res.json(conversations);
  } catch (err) {
    console.error("Error in searchConversations:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Thống kê ModMail trong cộng đồng (Số lượng Open, Pending, Closed, Unread)
 */
export const getStats = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const isCreator = community.creator.toString() === req.user.id;
    const isModerator = community.moderators.some(
      (modId) => modId.toString() === req.user.id
    );

    if (!isCreator && !isModerator) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }

    const total = await ModConversation.countDocuments({ community: communityId });
    const open = await ModConversation.countDocuments({ community: communityId, status: "open" });
    const pending = await ModConversation.countDocuments({ community: communityId, status: "pending" });
    const closed = await ModConversation.countDocuments({ community: communityId, status: "closed" });
    const unread = await ModConversation.countDocuments({
      community: communityId,
      unreadCountForMods: { $gt: 0 }
    });
    const unassigned = await ModConversation.countDocuments({
      community: communityId,
      assignee: null,
      status: { $ne: "closed" }
    });

    return res.json({
      total,
      open,
      pending,
      closed,
      unread,
      unassigned,
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Phân công ModMail cho một Moderator cụ thể
 */
export const assignConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { assigneeId } = req.body;

    const conv = await ModConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });

    const community = await Community.findById(conv.community);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const isCreator = community.creator.toString() === req.user.id;
    const isModerator = community.moderators.some(
      (modId) => modId.toString() === req.user.id
    );

    if (!isCreator && !isModerator) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }


    if (assigneeId) {
      const isValidAssignee =
        community.creator.toString() === assigneeId ||
        community.moderators.some((modId) => modId.toString() === assigneeId);

      if (!isValidAssignee) {
        return res.status(400).json({ message: "Người được phân công phải là Moderator hoặc Creator" });
      }
    }

    conv.assignee = assigneeId || null;
    await conv.save();

    await conv.populate({ path: "assignee", select: "name avatar" });
    await conv.populate({ path: "starter", select: "name avatar" });

    req.io.to(`modconv_${conversationId}`).emit("modmail:update", { conversation: conv });

    return res.json(conv);
  } catch (err) {
    console.error("Error in assignConversation:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lưu trữ hội thoại (Archive)
 */
export const archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { archived } = req.body;

    const conv = await ModConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });

    const community = await Community.findById(conv.community);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const isCreator = community.creator.toString() === req.user.id;
    const isModerator = community.moderators.some(
      (modId) => modId.toString() === req.user.id
    );

    if (!isCreator && !isModerator) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }

    conv.archived = archived !== undefined ? archived : true;
    await conv.save();

    return res.json(conv);
  } catch (err) {
    console.error("Error in archiveConversation:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Cập nhật mức độ ưu tiên (Priority: Low, Normal, High, Urgent)
 */
export const updatePriority = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { priority } = req.body;

    if (!["low", "normal", "high", "urgent"].includes(priority)) {
      return res.status(400).json({ message: "Giá trị ưu tiên không hợp lệ" });
    }

    const conv = await ModConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });

    const community = await Community.findById(conv.community);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });

    const isCreator = community.creator.toString() === req.user.id;
    const isModerator = community.moderators.some(
      (modId) => modId.toString() === req.user.id
    );

    if (!isCreator && !isModerator) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }

    conv.priority = priority;
    await conv.save();

    await conv.populate({ path: "starter", select: "name avatar" });
    await conv.populate({ path: "assignee", select: "name avatar" });

    req.io.to(`modconv_${conversationId}`).emit("modmail:update", { conversation: conv });

    return res.json(conv);
  } catch (err) {
    console.error("Error in updatePriority:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Xóa hội thoại ModMail (Chỉ Creator mới được xóa)
 */
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conv = await ModConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });

    const community = await Community.findById(conv.community);
    if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });


    if (community.creator.toString() !== userId) {
      return res.status(403).json({ message: "Chỉ chủ sở hữu cộng đồng mới có thể xóa cuộc hội thoại" });
    }

    await ModMessage.deleteMany({ conversation: conversationId });
    await ModConversation.findByIdAndDelete(conversationId);

    return res.json({ message: "Xóa cuộc hội thoại thành công" });
  } catch (err) {
    console.error("Error in deleteConversation:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy nội dung chi tiết (Messages) của một hội thoại
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conv = await ModConversation.findById(conversationId).populate(
      "community"
    );

    if (!conv) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });


    if (!conv.community) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng liên kết với hội thoại này" });
    }

    const isStarter = conv.starter.toString() === req.user.id;






    const community = await Community.findById(conv.community._id);

    if (!community) {
      return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
    }

    const isMod = community.creator.toString() === req.user.id;

    if (!isStarter && !isMod)
      return res.status(403).json({ message: "Bạn không thể xem cuộc hội thoại này" });

    const messages = await ModMessage.find({ conversation: conversationId })
      .populate({ path: "sender", select: "name avatar" })
      .sort({ createdAt: 1 });


    if (isMod) conv.unreadCountForMods = 0;
    else conv.unreadCountForUser = 0;

    await conv.save();

    return res.json(messages);
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Gửi tin nhắn trong ModMail
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    const conv = await ModConversation.findById(conversationId).populate(
      "community"
    );

    if (!conv) return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại" });

    const userId = req.user.id;

    const isStarter = conv.starter.toString() === userId;

    const community = await Community.findById(conv.community._id);
    const isMod =
      community.creator.toString() === userId;

    if (!isStarter && !isMod)
      return res.status(403).json({ message: "Không được phép" });

    if (conv.status === "closed") {
      return res.status(400).json({ message: "Cuộc hội thoại này đã đóng" });
    }

    const senderRole = isMod ? "mod" : "user";

    const msg = await ModMessage.create({
      conversation: conversationId,
      sender: userId,
      senderRole,
      text,
    });


    await msg.populate({ path: "sender", select: "name avatar" });


    conv.updatedAt = new Date();
    conv.lastMessagePreview = text.substring(0, 100);
    if (senderRole === "mod") conv.unreadCountForUser += 1;
    else conv.unreadCountForMods += 1;

    await conv.save();


    getIO().emit("new_modmail_message", {
      conversationId,
      message: msg,
    });

    return res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Cập nhật trạng thái hội thoại (Open, Pending, Closed) hoặc Assignee
 */
export const updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, assignee } = req.body;

    const conv = await ModConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Không tìm thấy" });

    if (status) conv.status = status;
    if (assignee) conv.assignee = assignee;

    await conv.save();


    getIO().emit("modmail_status_update", {
      conversationId: conv._id.toString(),
      status: conv.status,
    });

    return res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy tất cả hội thoại ModMail của các cộng đồng mà mình quản lý
 */
export const getAllManagedConversations = async (req, res) => {
  try {
    const userId = req.user.id;


    const communities = await Community.find({
      $or: [{ creator: userId }, { moderators: userId }],
    }).select("_id");

    const communityIds = communities.map((c) => c._id);

    const convs = await ModConversation.find({ community: { $in: communityIds } })
      .sort({ updatedAt: -1 })
      .populate({ path: "community", select: "name avatar" })
      .populate({ path: "starter", select: "name avatar" })
      .populate({ path: "assignee", select: "name avatar" });

    return res.json(convs);
  } catch (err) {
    console.error("Error in getAllManagedConversations:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Thống kê tổng hợp ModMail cho tất cả cộng đồng quản lý
 */
export const getAllManagedStats = async (req, res) => {
  try {
    const userId = req.user.id;


    const communities = await Community.find({
      $or: [{ creator: userId }, { moderators: userId }],
    }).select("_id");

    const communityIds = communities.map((c) => c._id);

    const matchQuery = { community: { $in: communityIds } };

    const total = await ModConversation.countDocuments(matchQuery);
    const open = await ModConversation.countDocuments({ ...matchQuery, status: "open" });
    const pending = await ModConversation.countDocuments({ ...matchQuery, status: "pending" });
    const closed = await ModConversation.countDocuments({ ...matchQuery, status: "closed" });
    const unread = await ModConversation.countDocuments({
      ...matchQuery,
      unreadCountForMods: { $gt: 0 },
    });
    const unassigned = await ModConversation.countDocuments({
      ...matchQuery,
      assignee: null,
      status: { $ne: "closed" },
    });

    return res.json({
      total,
      open,
      pending,
      closed,
      unread,
      unassigned,
    });
  } catch (err) {
    console.error("Error in getAllManagedStats:", err);
    res.status(500).json({ message: err.message });
  }
};
