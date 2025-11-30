import ModConversation from "../models/ModConversation.js";
import ModMessage from "../models/ModMessage.js";
import Community from "../models/Community.js";

// --------------------- CREATE CONVERSATION (USER) ---------------------
export const createConversation = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { subject, text } = req.body;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const conv = await ModConversation.create({
      community: communityId,
      starter: userId,
      subject: subject || "",
      unreadCountForMods: 1,
    });

    const msg = await ModMessage.create({
      conversation: conv._id,
      sender: userId,
      senderRole: "user",
      text,
    });

    // Populate sender để trả về đầy đủ thông tin
    await msg.populate({ path: "sender", select: "name avatar" });

    // SOCKET: gửi tới tất cả moderator đang online
    // req.io.to(`community_${communityId}_mods`).emit("modmail:new_conversation", {
    //   conversation: conv,
    // });

    return res.status(201).json({ conversation: conv, message: msg });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// --------------------- GET CONVERSATIONS (USER) ---------------------
export const getConversationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy tất cả conversations mà user là starter, populate community
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

// --------------------- GET CONVERSATIONS (MOD) ---------------------
export const getConversationsForMods = async (req, res) => {
  try {
    const { communityId } = req.params;

    // check community tồn tại
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // SECURITY FIX: Only creator can view modmail
    if (community.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // query conversations, populate starter + assignee an toàn
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

// --------------------- GET MESSAGES ---------------------
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conv = await ModConversation.findById(conversationId).populate(
      "community"
    );

    if (!conv) return res.status(404).json({ message: "Conversation not found" });

    // Check if community exists (in case it was deleted)
    if (!conv.community) {
      return res.status(404).json({ message: "Community associated with this conversation not found" });
    }

    const isStarter = conv.starter.toString() === req.user.id;

    // Re-fetch community to be sure we have the latest data (though populate gave us some)
    // Actually, since we populated 'community', conv.community IS the community document (if using Mongoose correctly).
    // However, the original code fetched it again using Community.findById(conv.community._id).
    // Let's stick to the original logic but add safety.

    const community = await Community.findById(conv.community._id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isMod = community.creator.toString() === req.user.id;

    if (!isStarter && !isMod)
      return res.status(403).json({ message: "You cannot view this conversation" });

    const messages = await ModMessage.find({ conversation: conversationId })
      .populate({ path: "sender", select: "name avatar" })
      .sort({ createdAt: 1 });

    // reset unread
    if (isMod) conv.unreadCountForMods = 0;
    else conv.unreadCountForUser = 0;

    await conv.save();

    return res.json(messages);
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ message: err.message });
  }
};

// --------------------- SEND MESSAGE ---------------------
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    const conv = await ModConversation.findById(conversationId).populate(
      "community"
    );

    if (!conv) return res.status(404).json({ message: "Conversation not found" });

    const userId = req.user.id;

    const isStarter = conv.starter.toString() === userId;

    const community = await Community.findById(conv.community._id);
    const isMod =
      community.creator.toString() === userId;

    if (!isStarter && !isMod)
      return res.status(403).json({ message: "Not allowed" });

    const senderRole = isMod ? "mod" : "user";

    const msg = await ModMessage.create({
      conversation: conversationId,
      sender: userId,
      senderRole,
      text,
    });

    // Populate sender để trả về đầy đủ thông tin
    await msg.populate({ path: "sender", select: "name avatar" });

    conv.updatedAt = new Date();
    if (senderRole === "mod") conv.unreadCountForUser += 1;
    else conv.unreadCountForMods += 1;

    await conv.save();

    // SOCKET gửi tới tất cả trong conversation room
    req.io.to(`modconv_${conversationId}`).emit("modmail:message", {
      message: msg,
      conversationId,
    });

    return res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------- UPDATE STATUS ---------------------
export const updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, assignee } = req.body;

    const conv = await ModConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Not found" });

    if (status) conv.status = status;
    if (assignee) conv.assignee = assignee;

    await conv.save();

    req.io
      .to(`modconv_${conversationId}`)
      .emit("modmail:update", { conversation: conv });

    return res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
