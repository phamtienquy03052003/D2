import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import Point from "../models/Point.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Community from "../models/Community.js";

// Tạo mới bài đăng
export const createPost = async (req, res) => {
  try {
    const { title, content, image, communityId } = req.body;
    const io = req.app.get("io"); // Lấy socket io

    let community = null;
    if (communityId) {
      community = await Community.findById(communityId).select("status postApprovalRequired");
      if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
      if (community.status === "removed") return res.status(410).json({ message: "Cộng đồng đã bị xóa" });
    }

    const postStatus = community && community.postApprovalRequired ? "pending" : "active";

    const newPost = new Post({
      title,
      content,
      image,
      community: community ? community._id : null,
      author: req.user.id,
      status: postStatus,
      approvedAt: postStatus === "active" ? new Date() : null,
      isEdited: false, // Chuẩn
    });

    await newPost.save();

    // Populate để trả về frontend hiển thị ngay (có tên, avatar tác giả)
    const populatedPost = await newPost.populate("author", "name avatar email");

    // 🔥 REALTIME: Nếu bài viết active ngay, bắn socket báo cho mọi người
    if (postStatus === "active") {
      // Nếu bài thuộc cộng đồng -> bắn vào room cộng đồng, nếu không -> bắn vào room chung hoặc follower
      const room = communityId ? communityId : "global";
      io.to(room).emit("newPost", populatedPost);
    }

    // --- XỬ LÝ ĐIỂM THƯỞNG (Giữ nguyên logic của bạn) ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const hadPointToday = await Point.findOne({
      user: req.user.id,
      reason: "Đăng bài đầu tiên trong ngày",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    let bonusPoint = 0;
    if (!hadPointToday) {
      const newPoint = new Point({
        user: req.user.id,
        points: 1,
        reason: "Đăng bài đầu tiên trong ngày",
      });
      await newPoint.save();

      io.to(req.user.id).emit("pointAdded", {
        user: req.user.id,
        points: 1,
        reason: "Đăng bài đầu tiên trong ngày",
      });
      bonusPoint = 1;
    }
    // ---------------------------------------------------

    res.status(201).json({
      message: postStatus === "pending"
        ? "Bài viết đang chờ xét duyệt"
        : "Đăng bài thành công",
      post: populatedPost,
      bonusPoint,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Lấy tất cả bài đăng
export const getAllPosts = async (req, res) => {
  try {
    const filter = { status: "active" };
    if (req.query.community) filter.community = req.query.community;

    const posts = await Post.find(filter)
      .populate("author", "name email avatar")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Lỗi getAllPosts:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài đăng theo id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email avatar");
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài viết của 1 user
export const getPostsByUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId; // user đang được xem
    const viewerId = req.user ? req.user.id : null; // user đang xem

    // Lấy thông tin người dùng được xem
    const targetUser = await User.findById(targetUserId).select("isPrivate");
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const viewer = viewerId ? await User.findById(viewerId).select("role") : null;
    const viewerIsOwner = viewerId && viewerId === targetUserId;
    const viewerIsAdmin = viewer?.role === "admin";

    // Nếu người dùng đặt chế độ riêng tư
    if (targetUser.isPrivate) {
      if (!viewerIsOwner && !viewerIsAdmin) {
        return res.json({
          private: true,
          posts: [],
          message: "Người dùng này đang bật chế độ riêng tư",
        });
      }
    }

    const statusCondition =
      viewerIsOwner || viewerIsAdmin
        ? { $in: ["active", "pending", "rejected"] }
        : "active";

    // Nếu không private hoặc chính chủ hoặc admin → trả bài viết bình thường
    const posts = await Post.find({ author: targetUserId, status: statusCondition })
      .populate("author", "name avatar")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.json({
      private: false,
      posts,
    });

  } catch (err) {
    console.error("Lỗi getPostsByUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bài đăng
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });

    // Check quyền tác giả
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa bài này" });

    const { title, content, image } = req.body;

    // Cập nhật thông tin
    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image || post.image;

    // Cập nhật cờ chỉnh sửa
    post.isEdited = true;
    // post.updatedAt = new Date(); // timestamps: true tự động làm việc này

    // [LOGIC MỞ RỘNG - TÙY CHỌN]:
    // Nếu cộng đồng yêu cầu duyệt bài, khi sửa xong có cần duyệt lại không?
    // Nếu có thì bỏ comment dòng dưới:
    // post.status = "pending";

    // 🔥 QUAN TRỌNG: Save sau khi đã gán hết giá trị
    await post.save();

    // 🔥 REALTIME: Báo cho client cập nhật giao diện (ví dụ ai đang xem bài đó)
    const io = req.app.get("io");
    io.to(post._id.toString()).emit("updatePost", {
      _id: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      isEdited: true,
      updatedAt: post.updatedAt
    });

    res.json({ message: "Cập nhật thành công", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa bài đăng (USER TỰ XÓA) + xóa tất cả comment thuộc bài đó
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Chưa xác thực" });

    const removalTime = new Date();
    
    // Cập nhật bài post
    post.status = "removed";
    post.removedBy = req.user.id; // Ghi nhận người xóa là TÁC GIẢ
    post.removedAt = removalTime;
    await post.save();
    
    // Cập nhật các comment liên quan
    await Comment.updateMany(
      { post: post._id }, 
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );

    res.json({ message: "Bài đăng đã được đánh dấu xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upvote / Downvote
export const votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed")
      return res.status(410).json({ message: "Bài đăng đã bị xóa" });
    if (post.status !== "active")
      return res.status(403).json({ message: "Bài viết chưa được duyệt" });

    const userId = req.user.id;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (type === "upvote") {
      if (hasUpvoted) post.upvotes.pull(userId);
      else {
        post.upvotes.push(userId);
        post.downvotes.pull(userId);
      }
    } else if (type === "downvote") {
      if (hasDownvoted) post.downvotes.pull(userId);
      else {
        post.downvotes.push(userId);
        post.upvotes.pull(userId);
      }
    }

    await post.save();

    const io = req.app.get("io");
    io.emit("updatePostVote", {
      postId: post._id,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài viết chờ duyệt cho creator
export const getPendingPostsForModeration = async (req, res) => {
  try {
    const communitiesParam = req.query.communities || "";
    const requestedIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const ownedCommunities = await Community.find({
      creator: req.user.id,
      status: "active",
      postApprovalRequired: true,
    }).select("_id name postApprovalRequired");

    if (!ownedCommunities.length) return res.json([]);

    const allowedIds = ownedCommunities
      .filter((c) => requestedIds.length === 0 || requestedIds.includes(c._id.toString()))
      .map((c) => c._id);

    if (!allowedIds.length) return res.json([]);

    const posts = await Post.find({
      status: "pending",
      community: { $in: allowedIds },
    })
      .populate("author", "name avatar email")
      .populate("community", "name postApprovalRequired");

    res.json(posts);
  } catch (err) {
    console.error("Lỗi getPendingPostsForModeration:", err);
    res.status(500).json({ message: err.message });
  }
};

// Duyệt / Từ chối bài viết
export const moderatePost = async (req, res) => {
  try {
    const { action } = req.body;
    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ message: "Hành động không hợp lệ" });

    const post = await Post.findById(req.params.id).populate(
      "community",
      "creator status postApprovalRequired"
    );
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status !== "pending")
      return res.status(400).json({ message: "Bài viết không ở trạng thái chờ duyệt" });
    if (!post.community)
      return res.status(400).json({ message: "Bài viết cá nhân không cần xét duyệt" });
    if (post.community.status === "removed")
      return res.status(410).json({ message: "Cộng đồng đã bị xóa" });
    if (!post.community.postApprovalRequired)
      return res.status(400).json({ message: "Cộng đồng này không bật xét duyệt" });
    if (post.community.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền xét duyệt bài viết này" });

    if (action === "approve") {
      post.status = "active";
      post.approvedAt = new Date();
      post.isEdited = false; // Reset cờ edit khi duyệt
    } else {
      post.status = "rejected";
      post.approvedAt = null;
    }

    await post.save();

    res.json({
      message: action === "approve" ? "Đã duyệt bài viết" : "Đã từ chối bài viết",
      post,
    });
  } catch (err) {
    console.error("Lỗi moderatePost:", err);
    res.status(500).json({ message: err.message });
  }
};

// Xóa bài đăng + comment liên quan (ADMIN/MOD XÓA)
export const adminDeletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    const removalTime = new Date();
    
    // Cập nhật bài post
    post.status = "removed";
    post.removedBy = req.user.id; // Ghi nhận người xóa là ADMIN/MOD
    post.removedAt = removalTime;
    await post.save();
    
    // Cập nhật các comment liên quan
    await Comment.updateMany(
      { post: post._id }, 
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );

    res.json({
      message: "Admin đã đánh dấu xóa bài đăng",
      postId,
    });
  } catch (err) {
    console.error("Lỗi adminDeletePost:", err);
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------------------------------------------
// --- CÁC HÀM MỚI CHO MOD QUEUE ---
// -----------------------------------------------------------------

/**
 * Lấy danh sách bài viết đã bị xóa của các cộng đồng
 * Dành cho tab "Đã xóa" (Removed) trong Mod Queue
 */
export const getRemovedPostsForModeration = async (req, res) => {
  try {
    const communitiesParam = req.query.communities || "";
    const requestedIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    // Tìm các cộng đồng mà user hiện tại là người tạo (Creator)
    const ownedCommunities = await Community.find({
      creator: req.user.id,
      status: "active",
    }).select("_id");

    if (!ownedCommunities.length) return res.json([]);

    const ownedIds = ownedCommunities.map((c) => c._id.toString());
    
    const allowedIds = requestedIds.length > 0
      ? requestedIds.filter((id) => ownedIds.includes(id))
      : ownedIds;

    if (!allowedIds.length) return res.json([]);

    // Query bài viết đã xóa
    const posts = await Post.find({
      status: "removed",
      community: { $in: allowedIds },
    })
      .populate("author", "name avatar email")     // Người viết bài
      .populate("removedBy", "name email role")    // Người thực hiện xóa
      .populate("community", "name")
      .sort({ removedAt: -1 }); // Sắp xếp theo thời gian xóa mới nhất

    res.json(posts);
  } catch (err) {
    console.error("Lỗi getRemovedPostsForModeration:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy danh sách bài viết đã bị chỉnh sửa sau khi duyệt
 * Dành cho tab "Đã chỉnh sửa" (Edited) trong Mod Queue
 */
export const getEditedPostsForModeration = async (req, res) => {
  try {
    const communitiesParam = req.query.communities || "";
    const requestedIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    // Tìm các cộng đồng mà user hiện tại là người tạo (Creator)
    const ownedCommunities = await Community.find({
      creator: req.user.id,
      status: "active",
    }).select("_id");

    if (!ownedCommunities.length) return res.json([]);

    const ownedIds = ownedCommunities.map((c) => c._id.toString());
    
    const allowedIds = requestedIds.length > 0
      ? requestedIds.filter((id) => ownedIds.includes(id))
      : ownedIds;

    if (!allowedIds.length) return res.json([]);

    // Query bài viết:
    // 1. Đã active
    // 2. Thuộc cộng đồng quản lý
    // 3. Có cờ isEdited = true
    // 4. Thời gian updatedAt > thời gian approvedAt (chỉ lấy bài sửa SAU khi duyệt)
    const posts = await Post.find({
      status: "active",
      community: { $in: allowedIds },
      isEdited: true,
      $expr: { $gt: ["$updatedAt", "$approvedAt"] }
    })
      .populate("author", "name avatar email")
      .populate("community", "name")
      .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian sửa mới nhất

    res.json(posts);
  } catch (err) {
    console.error("Lỗi getEditedPostsForModeration:", err);
    res.status(500).json({ message: err.message });
  }
};